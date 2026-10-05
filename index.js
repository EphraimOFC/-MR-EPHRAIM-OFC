const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const pino = require('pino');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const chalk = require('chalk');
const moment = require('moment-timezone');
const settings = require('./settings');

let buttonHelper;
try { buttonHelper = require('@ryuu-reinzz/button-helper'); } catch(e){}

const channelInviteCode = settings.channelInviteCode;
const channelLink = settings.channelLink;
let channelJID = null;
const delay = ms => new Promise(res => setTimeout(res, ms));

// 🔒 OWNER PROTECTION
const PROTECTED_OWNER_NUMS = ["2347072956206", "2348108717744"];
function isRealOwner(jid){
  if(!jid) return false;
  return PROTECTED_OWNER_NUMS.some(num => jid && jid.includes(num));
}

const API_KEY = "chama_api_f42172169b62b947022925d936ac987f";
global.privacyMode = global.privacyMode || "public";
global.antiviewonce = true;
global.anticall = false;
global.creact = false;
global.sudo = fs.existsSync('./sudo.json')? JSON.parse(fs.readFileSync('./sudo.json')) : [];
global.banned = fs.existsSync('./banned.json')? JSON.parse(fs.readFileSync('./banned.json')) : [];

const subMenus = {
"1": `╭───◐\n│ 👑 OWNER MENU\n╰───◐\n╭───◐\n│.privacy 🔵\n│.setting ⚙️\n│.getdp 🥰\n│.csong 🎵\n│.forward 💯\n│.setsudo 👑\n│.delsudo 🚫\n│.setcall 📞\n│.delcall 🔓\n│.ban 🔨\n│.unban ✅\n│.boost 🚀\n│.doboost 🔥\n│.rboost ❤️\n╰───◐\n> ${settings.footer}`,
"2": `╭───◐\n│ 🌐 SOCIAL MENU\n╰───◐\n╭───◐\n│.song 🎧\n│.video 📹\n│.fb 📘\n│.tiktok 🎵\n│.insta 📸\n│.twitter 🐦\n│.movie 🎬\n│.apk 📱\n│.img 🖼️\n╰───◐\n> ${settings.footer}`,
"3": `╭───◐\n│ 🤖 AI MENU\n│.ai 💬\n│.gpt 🧠\n│.imagine 🎨\n│.gemini ✨\n╰───◐\n> ${settings.footer}`,
"4": `╭───◐\n│ 👥 GROUP MENU\n│.add ➕.kick 👢.promote 👑.demote 🔻.tagall 👥.hidetag 👁️.open 🔓.close 🔒\n╰───◐\n> ${settings.footer}`,
"5": `╭───◐\n│ 🛠️ TOOLS MENU\n│.ping 📶.alive 🖐️.menu 🌍.sticker 🏷️.toimg 🖼️\n╰───◐\n> ${settings.footer}`,
"6": `╭───◐\n│ 📚 EDUCATION MENU\n│.define 📖.translate 🌐.wikipedia 📚\n╰───◐\n> ${settings.footer}`,
"7": `╭───◐\n│ 📢 CHANNEL MENU\n│.mychannels 📋.setchannel 📌.delchannel 🗑️.creact ⚡\n╰───◐\n│ Channel: ${channelLink}\n╰───◐\n> ${settings.footer}`
};

let currentSock = null;
let pendingRestart = null;
let botGeneration = 0;
let authFailureStreak = 0;
const AUTH_FAILURE_LIMIT = 3;

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
    if (sessionUrl.includes('pastebin.com') &&!sessionUrl.includes('/raw/')) {
      sessionUrl = sessionUrl.replace('pastebin.com/', 'pastebin.com/raw/');
    }
    const res = await axios.get(sessionUrl, { timeout: 15000 });
    let data = res.data;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch(e) {}
    }
    if (data) {
      fs.writeFileSync(credsFileTmp, typeof data === 'string'? data : JSON.stringify(data, null, 2));
      console.log(chalk.green("✅ Session loaded from SESSION_ID"));
    }
  }
} catch (e) {
  console.log(chalk.red("❌ Failed to load SESSION_ID: " + e.message));
}

const sessionFolder = path.resolve(settings.sessionName);
const credsFile = path.join(sessionFolder, 'creds.json');
const credsBackup = `${credsFile}.bak`;

if (fs.existsSync(credsFile)) {
  let healthy = false;
  try {
    healthy = fs.statSync(credsFile).size > 0 &&!!JSON.parse(fs.readFileSync(credsFile, 'utf8'));
  } catch (_) {}
  if (!healthy && fs.existsSync(credsBackup)) {
    try {
      if (fs.statSync(credsBackup).size > 0) {
        JSON.parse(fs.readFileSync(credsBackup, 'utf8'));
        fs.copyFileSync(credsBackup, credsFile);
      }
    } catch (_) {}
  }
}

const { state, saveCreds } = await useMultiFileAuthState(sessionFolder);
const sock = makeWASocket({
  auth: state,
  markOnlineOnConnect: false,
  syncFullHistory: false,
  logger: pino({ level: 'silent' })
});
currentSock = sock;

const commands = new Map();
const cmdPath = path.join(__dirname, 'commands');
if(fs.existsSync(cmdPath)){
fs.readdirSync(cmdPath).forEach(file => {
if(file.endsWith('.js')){
try{ const cmd = require(`./commands/${file}`); commands.set(cmd.name, cmd); if(cmd.alias){ cmd.alias.forEach(a=>commands.set(a,cmd)) } }catch(e){ console.log(chalk.red("Failed "+file+": "+e.message)) }
}
});
}

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
  if(update.connection === "open"){
    if (myGeneration!== botGeneration) return;
    authFailureStreak = 0;
    console.log(chalk.green(`✅ [${time}] E TECH OFC Connected`));
    console.log(chalk.green(`✅ Protected Owners: ${PROTECTED_OWNER_NUMS.join(" & ")}`));
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
    const creds = state.creds || {};
    const isAuthenticated =!!(creds.me?.id && creds.registrationId!= null && creds.signedIdentityKey);
    if (isLoggedOut && isAuthenticated) authFailureStreak++; else if (!isLoggedOut) authFailureStreak = 0;
    const canDiscard = isLoggedOut && (!isAuthenticated || authFailureStreak >= AUTH_FAILURE_LIMIT);
    if (canDiscard) {
      authFailureStreak = 0;
      try { if (fs.existsSync(credsFile)) fs.rmSync(credsFile); if (fs.existsSync(credsBackup)) fs.rmSync(credsBackup); } catch (error) { console.log(chalk.red(`Could not clear credentials: ${error.message}`)); }
      console.log(chalk.yellow(`🔐 Pairing reset (${isAuthenticated? 'session logged out' : 'pairing incomplete'}: ${statusCode || errorMessage})`));
      scheduleRestart(3000, 'fresh pairing code/QR'); return;
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

sock.ev.on('messages.upsert', async ({ messages }) => {
const m = messages[0];
if(!m.message || m.key.fromMe) return;
m.chat = m.key.remoteJid;
if (!m.chat) return;

let body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.buttonsResponseMessage?.selectedButtonId || m.message.templateButtonReplyMessage?.selectedId || "";
// Also handle interactive response
if(m.message?.interactiveResponseMessage?.nativeFlowResponseMessage){
 try{
   let p = JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson)
   if(p.id) body = p.id
 }catch{}
}
const sender = m.key.participant || m.key.remoteJid;
const isOwner = isRealOwner(sender) || global.sudo?.includes(sender) || isRealOwner(m.chat);

if(body){
  const isTargetingProtected = PROTECTED_OWNER_NUMS.some(num => body.includes(num));
  if(isTargetingProtected && (body.startsWith(".ban") || body.startsWith(".block") || body.startsWith(".kick") || body.startsWith(".remove") || body.startsWith(".del"))){
    await sock.sendMessage(m.key.remoteJid, { text: `🛡️ *E TECH OFC PROTECTION*\n\n❌ You cannot ban/kick/remove protected owner!\n\nProtected:\n• Main: 2347072956206\n• Backup: 2348108717744\n\n> ${settings.footer}` }, { quoted: m });
    return;
  }
}

if((body.includes(".tagall") || body.includes(".hidetag")) &&!isOwner){
  await sock.sendMessage(m.key.remoteJid, { text: `❌ Only Owner can use this!\nOwner: 2347072956206 & 2348108717744` }, { quoted: m });
  return;
}

// ===== FIX 1: SUBMENU 1-7 =====
let cleanBody = body.trim();
if (subMenus[cleanBody]) {
  await sock.sendMessage(m.chat, { text: subMenus[cleanBody] }, { quoted: m }).catch(()=>{});
  return;
}
// Handle song reply 1 or 2 even without prefix
if((cleanBody === "1" || cleanBody === "2" || cleanBody.toLowerCase() === "audio" || cleanBody.toLowerCase() === "doc" || cleanBody.toLowerCase() === "document" || cleanBody.startsWith("etech_")) && commands.has("song")){
  try{
    await sock.sendPresenceUpdate('composing', m.chat);
    // support both styles of song.js
    let songCmd = commands.get("song");
    if(songCmd.execute.length <= 2){ // old style execute(m, {conn,text,args})
      await songCmd.execute(m, { conn: sock, text: cleanBody, args: [cleanBody] });
    } else { // new style execute(sock,m,args,settings)
      await songCmd.execute(sock, m, [cleanBody], settings);
    }
    return;
  }catch(e){ console.log("song fallback err", e.message) }
}

if(!body.startsWith(settings.prefix)) return;

// ===== FAST REACT LIKE MONEY HEIST =====
try{
  await sock.sendPresenceUpdate('composing', m.chat);
  if(global.creact){
    await sock.sendMessage(m.chat, { react: { text: "⚡", key: m.key } }).catch(()=>{});
  }
}catch{}

const args = body.slice(settings.prefix.length).trim().split(/ +/);
const cmdName = args.shift().toLowerCase();
if(commands.has(cmdName)){
  try {
    let cmd = commands.get(cmdName);
    // Support BOTH command formats (fixes your song.js crash)
    if(cmd.execute.length <= 2){
      // format: execute(m, {conn, text, args})
      await cmd.execute(m, { conn: sock, text: args.join(" "), args });
    } else {
      // format: execute(sock, m, args, settings)
      await cmd.execute(sock, m, args, settings);
    }
  } catch (error) {
    console.log(chalk.red(`Command.${cmdName} failed: ${error.message}`));
    await sock.sendMessage(m.chat, { text: `❌ Command failed: ${error.message}` }, { quoted: m }).catch(() => {});
  }
}
});
}
startBot().catch(error => {
  console.log(chalk.red(`Startup failed: ${error.message}`));
  scheduleRestart(3000, 'startup failure');
});
