const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, downloadContentFromMessage, jidNormalizedUser } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const chalk = require('chalk');
const moment = require('moment-timezone');
const settings = require('./settings');
const { startAllPairedBots } = require('./lib/paired-bot');

const channelInviteCode = settings.channelInviteCode;
const channelLink = settings.channelLink;
let channelJID = null;
const delay = ms => new Promise(res => setTimeout(res, ms));

// 🔒 OWNER PROTECTION — numbers are read only from settings, never hard-coded in the handler.
const PROTECTED_OWNER_NUMS = (settings.protectedNumbers || settings.ownerNumbers || []).map(String);
function isRealOwner(jid){
  if(!jid) return false;
  const normalized = jidNormalizedUser(jid);
  return PROTECTED_OWNER_NUMS.some(num => normalized.includes(num));
}

global.privacyMode = global.privacyMode || "public";
global.antiviewonce = true;
global.antidelete = true;
global.anticall = false;
global.creact = true;
global.sudo = fs.existsSync('./sudo.json')? JSON.parse(fs.readFileSync('./sudo.json')) : [];
global.banned = fs.existsSync('./banned.json')? JSON.parse(fs.readFileSync('./banned.json')) : [];
global.reactEmojis = global.reactEmojis || ['⚡','🔥','❤️','💯','😍','🤩','😎','👑','✨','🚀','🎯','😂','🥶','🫡'];

const subMenus = {
"1": `╭───◐
│ 👑 OWNER MENU
╰───◐
│ .privacy
│ .setting
│ .getdp
│ .forward
│ .setsudo / .delsudo
│ .setcall / .delcall
│ .ban / .unban
│ .boost / .doboost / .rboost
│ .glink / .glinkreset
╰───◐
${settings.footer}`,
"2": `╭───◐
│ 🌐 SOCIAL MENU
╰───◐
│ .song / .play
│ .video
│ .tiktok
│ .insta
│ .fb
│ .movie
│ .apk
│ .img
│ .url
│ .cinesubz
│ .ss
╰───◐
${settings.footer}`,
"3": `╭───◐
│ 🤖 AI MENU
╰───◐
│ AI commands are not installed yet.
│ Use the working commands in the other menus.
╰───◐
${settings.footer}`,
"4": `╭───◐
│ 👥 GROUP MENU
╰───◐
│ .add / .kick
│ .promote / .demote
│ .tagall / .hidetag
│ .open / .close
│ .leave
╰───◐
${settings.footer}`,
"5": `╭───◐
│ 🛠️ TOOLS MENU
╰───◐
│ .ping / .alive / .system
│ .sticker
│ .antiviewonce
│ .hide / .unhide
│ .bot / .send
╰───◐
${settings.footer}`,
"6": `╭───◐
│ 📚 EDUCATION MENU
╰───◐
│ Education commands are not installed yet.
│ Use the working commands in the other menus.
╰───◐
${settings.footer}`,
"7": `╭───◐
│ 📢 CHANNEL MENU
╰───◐
│ .channelmenu
│ .csong
│ .creact
│ Channel: ${channelLink}
╰───◐
${settings.footer}`
};

const menuReplyUntil = new Map();
const messageStore = new Map();
const MESSAGE_STORE_TTL = 10 * 60 * 1000;
const MESSAGE_STORE_MAX = 500;

let currentSock = null;
let pendingRestart = null;
let botGeneration = 0;

function scheduleRestart(delayMs, reason) {
  if (pendingRestart) return;
  pendingRestart = setTimeout(() => {
    pendingRestart = null;
    console.log(chalk.yellow(`🔄 Reconnecting (${reason})...`));
    startBot().catch(error => console.log(chalk.red(`Reconnect failed: ${error.message}`)));
  }, delayMs);
}

async function startBot() {
if (currentSock) {
  try { await currentSock.end(undefined, undefined, { reason: 'superseded' }); } catch (_) {}
  currentSock = null;
}
const myGeneration = ++botGeneration;

try {
  if (process.env.SESSION_ID) {
    const sessionFolderTmp = path.resolve(settings.sessionName);
    if (!fs.existsSync(sessionFolderTmp)) fs.mkdirSync(sessionFolderTmp, { recursive: true });
    const credsFileTmp = path.join(sessionFolderTmp, 'creds.json');
    console.log(chalk.cyan("📥 Checking SESSION_ID..."));
    let sessionUrl = process.env.SESSION_ID.trim();
    if (sessionUrl.includes('pastebin.com') &&!sessionUrl.includes('/raw/')) sessionUrl = sessionUrl.replace('pastebin.com/', 'pastebin.com/raw/');
    const res = await axios.get(sessionUrl, { timeout: 15000 });
    let data = res.data;
    if (typeof data === 'string') { try { data = JSON.parse(data); } catch(e) {} }
    if (data) {
      fs.writeFileSync(credsFileTmp, typeof data === 'string'? data : JSON.stringify(data, null, 2));
      console.log(chalk.green("✅ Session loaded from SESSION_ID"));
    }
  }
} catch (e) { console.log(chalk.red("❌ Failed to load SESSION_ID: " + e.message)); }

const sessionFolder = path.resolve(settings.sessionName);
const credsFile = path.join(sessionFolder, 'creds.json');
const credsBackup = `${credsFile}.bak`;

if (fs.existsSync(credsFile)) {
  let healthy = false;
  try { healthy = fs.statSync(credsFile).size > 0 &&!!JSON.parse(fs.readFileSync(credsFile, 'utf8')); } catch (_) {}
  if (!healthy && fs.existsSync(credsBackup)) {
    try {
      if (fs.statSync(credsBackup).size > 0) { JSON.parse(fs.readFileSync(credsBackup, 'utf8')); fs.copyFileSync(credsBackup, credsFile); }
    } catch (_) {}
  }
}

const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
const sock = makeWASocket({
  auth: state,
  markOnlineOnConnect: false,
  syncFullHistory: false,
  emitOwnEvents: true,
  logger: pino({ level: 'silent' })
});
currentSock = sock;

let pairingCodeRequested = false;
async function requestPairingCodeIfNeeded() {
  const phone = String(process.env.PAIRING_NUMBER || '').replace(/\D/g, '');
  if (!phone || pairingCodeRequested || state.creds.registered) return;
  pairingCodeRequested = true;
  try {
    await delay(2000);
    const code = await sock.requestPairingCode(phone);
    console.log(chalk.cyan(`🔗 Pairing code for +${phone}: ${String(code).match(/.{1,4}/g)?.join('-') || code}`));
  } catch (error) {
    pairingCodeRequested = false;
    console.log(chalk.red(`❌ Pairing code request failed: ${error.message}`));
  }
}

const commands = new Map();
const cmdPath = path.join(__dirname, 'commands');
function loadCommands(){
  commands.clear();
  if(!fs.existsSync(cmdPath)) return;
  for(const file of fs.readdirSync(cmdPath)){
    if(!file.endsWith('.js')) continue;
    try{
      const cmd = require(path.join(cmdPath, file));
      if(!cmd?.name || typeof cmd.execute !== 'function') continue;
      const name = String(cmd.name).toLowerCase();
      if(commands.has(name)){
        console.log(chalk.yellow('⚠️ Duplicate command skipped: ' + name + ' (' + file + ')'));
        continue;
      }
      commands.set(name, cmd);
      for(const alias of (cmd.alias || [])){
        const key = String(alias).toLowerCase();
        if(!commands.has(key)) commands.set(key, cmd);
      }
    }catch(e){ console.log(chalk.red('Failed '+file+': '+e.message)); }
  }
}
loadCommands();
sock.ev.on('creds.update', async (creds) => {
  await saveCreds(creds);
  try {
    const raw = fs.readFileSync(credsFile, 'utf8');
    JSON.parse(raw);
    const tmp = `${credsBackup}.tmp`;
    fs.writeFileSync(tmp, raw);
    fs.renameSync(tmp, credsBackup);
  } catch (_) {}
});

sock.ev.on('connection.update', async (update) => {
  const time = moment().tz("Africa/Lagos").format("HH:mm:ss");
  if (update.qr) qrcode.generate(update.qr, { small: true });
  if(update.connection === "connecting" || update.qr){
    requestPairingCodeIfNeeded().catch(error => console.log(chalk.red('Pairing request failed: '+error.message)));
  }
  if(update.connection === "open"){
    if (myGeneration!== botGeneration) return;
    authFailureStreak = 0;
    global.botJid = jidNormalizedUser(sock.user?.id || '');
    global.botNumber = global.botJid.split('@')[0] || '';
    console.log(chalk.green(`✅ [${time}] E TECH OFC Connected as ${global.botNumber ? '+' + global.botNumber : 'WhatsApp account'}`));
    startAllPairedBots(settings).catch(e => console.log(chalk.yellow('⚠️ Paired bot startup skipped: '+e.message)));
    try {
      if (!channelJID) {
        const meta = await sock.newsletterMetadata("invite", channelInviteCode);
        channelJID = meta?.id || meta?.jid || meta?.newsletter?.id;
      }
      if (!channelJID) throw new Error('channel metadata did not contain a valid JID');
      await sock.newsletterFollow(channelJID);
      console.log(chalk.cyan("✅ Auto-followed E TECH OFC channel"));
    } catch(e){ console.log(chalk.yellow(`⚠️ Channel follow skipped: ${e.message}`)); }
  }
  if(update.connection === "close"){
    if (myGeneration!== botGeneration) return;
    const statusCode = update.lastDisconnect?.error?.output?.statusCode;
    const errorMessage = update.lastDisconnect?.error?.message || 'unknown error';
    const isLoggedOut = statusCode === DisconnectReason.loggedOut;
    if (isLoggedOut) {
      console.log(chalk.red(`🔐 WhatsApp session logged out (${statusCode || errorMessage}). Auth files were preserved. Rename the session folder only when you intentionally want to relink.`));
      return;
    }
    console.log(chalk.yellow(`Connection closed (${statusCode || errorMessage}); preserving auth and reconnecting`));
    scheduleRestart(3000, `server close ${statusCode || errorMessage}`);
  }
});

sock.ev.on('call', async (calls) => {
 if(global.anticall){
  for(let call of calls){ if(call.status === "offer"){ await sock.rejectCall(call.id, call.from).catch(()=>{}); } }
 }
});

function cacheIncomingMessage(m) {
  if (!m?.key?.id || !m?.message) return;
  messageStore.set(m.key.id, { message: m, time: Date.now() });
  if (messageStore.size > MESSAGE_STORE_MAX) {
    const oldest = messageStore.keys().next().value;
    if (oldest) messageStore.delete(oldest);
  }
}

function unwrapMessageContent(message) {
  let current = message;
  let viewOnce = false;
  for (let i = 0; i < 8 && current; i++) {
    if (current.ephemeralMessage?.message) { current = current.ephemeralMessage.message; continue; }
    if (current.viewOnceMessage?.message) { current = current.viewOnceMessage.message; viewOnce = true; continue; }
    if (current.viewOnceMessageV2?.message) { current = current.viewOnceMessageV2.message; viewOnce = true; continue; }
    if (current.viewOnceMessageV2Extension?.message) { current = current.viewOnceMessageV2Extension.message; viewOnce = true; continue; }
    if (current.documentWithCaptionMessage?.message) { current = current.documentWithCaptionMessage.message; continue; }
    break;
  }
  return { message: current, viewOnce };
}

function ownerInboxJid(fallback) {
  const number = String(settings.ownerNumber || (settings.ownerNumbers || [])[0] || '').replace(/\D/g, '');
  return number ? number + '@s.whatsapp.net' : jidNormalizedUser(sock.user?.id || fallback || '');
}

async function recoverDeletedMessage(key) {
  if (!global.antidelete || !key?.id) return;
  const cached = messageStore.get(key.id);
  if (!cached || Date.now() - cached.time > MESSAGE_STORE_TTL) { messageStore.delete(key.id); return; }
  const original = cached.message;
  const content = original.message || {};
  const header = '╭─〔 🗑️ ANTI-DELETE RECOVERY 〕─╮\n│ 👤 From: ' + String(original.key?.participant || original.key?.remoteJid || 'unknown').split('@')[0] + '\n╰────────────────────╯';
  try {
    if (content.conversation || content.extendedTextMessage?.text) {
      const body = content.conversation || content.extendedTextMessage.text;
      await sock.sendMessage(ownerInboxJid(original.key?.remoteJid), { text: header + '\n\n' + body + '\n\n' + settings.footer }, { quoted: original });
      return;
    }
    const unwrapped = unwrapMessageContent(content).message || {};
    const type = ['imageMessage','videoMessage','audioMessage','documentMessage','stickerMessage'].find(k => unwrapped[k]);
    if (!type) return;
    const media = unwrapped[type];
    const stream = await downloadContentFromMessage(media, type.replace('Message',''));
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    const target = ownerInboxJid(original.key?.remoteJid);
    if (type === 'imageMessage') await sock.sendMessage(target, { image: buffer, caption: header + (media.caption ? '\n\n📝 ' + media.caption : '') + '\n\n' + settings.footer }, { quoted: original });
    if (type === 'videoMessage') await sock.sendMessage(target, { video: buffer, caption: header + (media.caption ? '\n\n📝 ' + media.caption : '') + '\n\n' + settings.footer }, { quoted: original });
    if (type === 'audioMessage') await sock.sendMessage(target, { audio: buffer, mimetype: media.mimetype || 'audio/ogg', ptt: !!media.ptt }, { quoted: original });
    if (type === 'documentMessage') await sock.sendMessage(target, { document: buffer, fileName: media.fileName || 'recovered-file', mimetype: media.mimetype || 'application/octet-stream', caption: header + '\n\n' + settings.footer }, { quoted: original });
    if (type === 'stickerMessage') await sock.sendMessage(target, { sticker: buffer }, { quoted: original });
  } catch (error) { console.log(chalk.yellow('Anti-delete recovery failed: ' + error.message)); }
  finally { messageStore.delete(key.id); }
}

sock.ev.on('messages.upsert', ({ messages }) => {
  for (const m of messages || []) {
    cacheIncomingMessage(m);
    handleMessage(m).catch(error => console.log(chalk.red('Message handler failed: ' + error.message)));
  }
});

sock.ev.on('messages.delete', async (event) => {
  const keys = Array.isArray(event) ? event : (event?.keys || []);
  for (const key of keys) await recoverDeletedMessage(key).catch(() => {});
});

async function handleViewOnce(m){
  if(!global.antiviewonce || !m?.message || m.key?.fromMe) return false;
  const unwrapped = unwrapMessageContent(m.message);
  if(!unwrapped.viewOnce) return false;
  const content = unwrapped.message || {};
  const type = ['imageMessage','videoMessage','audioMessage','documentMessage'].find(k => content[k]);
  if(!type) return false;
  try {
    const media = content[type];
    const stream = await downloadContentFromMessage(media, type.replace('Message',''));
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);
    const header = '╭─〔 👁️ VIEW-ONCE RECOVERY 〕─╮\n│ 🟢 Media recovered successfully\n│ 📦 Type: *' + type.replace('Message','').toUpperCase() + '*\n│ 📍 Sent to owner inbox\n╰────────────────────╯';
    const caption = media.caption ? '\n\n📝 *Original caption:* ' + media.caption : '';
    const target = ownerInboxJid(m.key.remoteJid);
    if(type === 'imageMessage') await sock.sendMessage(target, { image: buffer, caption: header + caption + '\n\n' + settings.footer }, { quoted:m });
    if(type === 'videoMessage') await sock.sendMessage(target, { video: buffer, caption: header + caption + '\n\n' + settings.footer }, { quoted:m });
    if(type === 'audioMessage') await sock.sendMessage(target, { audio: buffer, mimetype: media.mimetype || 'audio/ogg', ptt: !!media.ptt }, { quoted:m });
    if(type === 'documentMessage') await sock.sendMessage(target, { document: buffer, fileName: media.fileName || 'view-once-file', mimetype: media.mimetype || 'application/octet-stream', caption: header + caption + '\n\n' + settings.footer }, { quoted:m });
    return true;
  } catch(error) { console.log(chalk.yellow('Anti-ViewOnce failed: ' + error.message)); return false; }
}

async function handleMessage(m){
  if(!m?.message) return;
  if(await handleViewOnce(m)) return;
  m.chat = m.key.remoteJid;
  if(!m.chat) return;
  if(global.creact && m.chat.endsWith('@newsletter') && !m.key.fromMe){
    const emojis = global.reactEmojis?.length ? global.reactEmojis : ['⚡','🔥','❤️','💯'];
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    sock.sendMessage(m.chat, { react:{ text:emoji, key:m.key } }).catch(()=>{});
    return;
  }
  function extractInteractiveId(message){
    if(!message || typeof message !== 'object') return '';
    const direct =
      message.buttonsResponseMessage?.selectedButtonId ||
      message.templateButtonReplyMessage?.selectedId ||
      message.listResponseMessage?.singleSelectReply?.selectedRowId ||
      message.interactiveResponseMessage?.body?.text;
    if(direct) return String(direct);
    const native = message.interactiveResponseMessage?.nativeFlowResponseMessage;
    if(native){
      const raw = native.paramsJson;
      try {
        const json = typeof raw === 'string'
          ? raw
          : Buffer.isBuffer(raw)
            ? raw.toString('utf8')
            : raw instanceof Uint8Array
              ? Buffer.from(raw).toString('utf8')
              : String(raw || '');
        const parsed = JSON.parse(json || '{}');
        const id = parsed.id || parsed.selectedId || parsed.selected_id || parsed.display_text || parsed.displayText;
        if(id) return String(id);
      } catch (_) {}
    }
    for(const wrapper of ['ephemeralMessage','viewOnceMessage','viewOnceMessageV2','viewOnceMessageV2Extension','documentWithCaptionMessage']){
      const nested = message[wrapper]?.message;
      const id = extractInteractiveId(nested);
      if(id) return id;
    }
    return '';
  }

  let body =
    m.message.conversation ||
    m.message.extendedTextMessage?.text ||
    extractInteractiveId(m.message) ||
    '';
  body = String(body || '').trim();
  if(!body) return;
  // Keep native button replies observable during setup/debugging.
  if(!body.startsWith(settings.prefix) && /^(main_menu|create_bot|visit_site|menu_\\d|etech_song_|AUDIO|DOCUMENT)$/i.test(body)){
    console.log(chalk.cyan('🔘 Button action received: ' + body));
  }
  const sender = m.key.participant || m.key.remoteJid;
  const isOwner = isRealOwner(sender) || global.sudo?.includes(sender) || isRealOwner(m.chat);
  const chatIsGroup = m.chat.endsWith('@g.us');
  const chatIsPrivate = m.chat.endsWith('@s.whatsapp.net');
  if(global.banned?.includes(sender) && !isOwner) return;
  if(global.privacyMode === 'private' && !isOwner) return;
  if(global.privacyMode === 'group' && !chatIsGroup && !isOwner) return;
  if(global.privacyMode === 'pc' && !chatIsPrivate && !isOwner) return;
  const isTargetingProtected = PROTECTED_OWNER_NUMS.some(num => body.includes(num));
  if(isTargetingProtected && /^(\.ban|\.block|\.kick|\.remove|\.del)\b/i.test(body)){
    return sock.sendMessage(m.chat, { text: '🛡️ *E TECH OFC PROTECTION*\n\n❌ You cannot ban/kick/remove protected owner!\n\n' + settings.footer }, { quoted:m }).catch(()=>{});
  }
  if(/^\.(tagall|hidetag)\b/i.test(body) && !isOwner){
    return sock.sendMessage(m.chat, { text: '❌ Only Owner can use this!' }, { quoted:m }).catch(()=>{});
  }
  // Native menu buttons can call commands directly, keeping the UI fast and consistent.
  if(body === 'main_menu') return runCommand(commands.get('menu'), m, []);
  if(body === 'create_bot') return runCommand(commands.get('bot'), m, []);
  if(body === 'visit_site') return sock.sendMessage(m.chat, {
    text: '🌐 *E TECH OFC WEBSITE*\n\nTap the link below to open the official bot site:\n' + settings.botLink
  }, { quoted:m }).catch(()=>{});
  if(/^menu_\d$/.test(body)){
    const menuId = body.slice(-1);
    if(subMenus[menuId]) return sock.sendMessage(m.chat, { text: subMenus[menuId] }, { quoted:m }).catch(()=>{});
  }
  if(/^\d$/.test(body)){
    const expiresAt = menuReplyUntil.get(m.chat) || 0;
    if(expiresAt > Date.now() && subMenus[body]){
      menuReplyUntil.delete(m.chat);
      return sock.sendMessage(m.chat, { text: subMenus[body] }, { quoted:m }).catch(()=>{});
    }
    return;
  }
  if(body.startsWith('etech_song_') && commands.has('song')) return runCommand(commands.get('song'), m, [body]);
  if(/^(AUDIO|DOCUMENT)$/i.test(body) && commands.has('song')){
    return runCommand(commands.get('song'), m, ['etech_song_' + body.toLowerCase()]);
  }
  if(!body.startsWith(settings.prefix)) return;
  const parts = body.slice(settings.prefix.length).trim().split(/\s+/);
  const cmdName = (parts.shift() || '').toLowerCase();
  const cmd = commands.get(cmdName);
  if(!cmd) return;
  sock.sendPresenceUpdate('composing', m.chat).catch(()=>{});
  return runCommand(cmd, m, parts);
}

async function runCommand(cmd, m, args){
  try{
    const text = args.join(' ');
    const result = cmd.execute.length <= 2 ? await cmd.execute(m, { conn:sock, text, args }) : await cmd.execute(sock, m, args, settings);
    if(String(cmd.name || '').toLowerCase() === 'menu') menuReplyUntil.set(m.chat, Date.now() + 120000);
    if(global.creact){
      const reaction = String(cmd.name || '').toLowerCase() === 'alive' ? '🌍' : result === false ? '❌' : '✅';
      sock.sendMessage(m.chat, { react:{ text:reaction, key:m.key } }).catch(()=>{});
    }
    return result;
  }catch(error){
    console.log(chalk.red('Command failed: ' + (cmd.name || 'unknown') + ': ' + error.message));
    sock.sendMessage(m.chat, { react:{ text:'❌', key:m.key } }).catch(()=>{});
    await sock.sendMessage(m.chat, { text:'❌ Command failed: ' + error.message }, { quoted:m }).catch(()=>{});
  }
}
}
startBot().catch(error => {
  console.log(chalk.red(`Startup failed: ${error.message}`));
  scheduleRestart(3000, 'startup failure');
});
