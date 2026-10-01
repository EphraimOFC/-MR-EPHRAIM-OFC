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
const followedUsers = new Set();
const delay = ms => new Promise(res => setTimeout(res, ms));

// 🔒 OWNER PROTECTION - E TECH OFC - MAIN + BACKUP BOTH PROTECTED
const PROTECTED_OWNER_NUMS = ["2347072956206", "2348108717744"];

const protectedOwners = PROTECTED_OWNER_NUMS.flatMap(num => [
  `${num}@s.whatsapp.net`,
  `${num}@lid`,
  `${num}@c.us`
]);

function isRealOwner(jid){
  if(!jid) return false;
  return PROTECTED_OWNER_NUMS.some(num => jid.includes(num));
}

// ===== API KEY DIRECT =====
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

// Keep reconnects single-flight. A socket can emit close while a scheduled
// restart is already replacing it; without this guard two sockets can race on
// the same auth files.
let currentSock = null;
let pendingRestart = null;
let botGeneration = 0;
let authFailureStreak = 0;
const AUTH_FAILURE_LIMIT = 3;

function scheduleRestart(delay, reason) {
  if (pendingRestart) return;
  pendingRestart = setTimeout(() => {
    pendingRestart = null;
    console.log(chalk.yellow(`🔄 Reconnecting (${reason})...`));
    startBot().catch(error => console.log(chalk.red(`Reconnect failed: ${error.message}`)));
  }, delay);
}

async function startBot() {
if (currentSock) {
  try { await currentSock.end(undefined, undefined, { reason: 'superseded' }); } catch (_) {}
  currentSock = null;
}
const myGeneration = ++botGeneration;
const sessionFolder = path.resolve(settings.sessionName);
const credsFile = path.join(sessionFolder, 'creds.json');
const credsBackup = `${credsFile}.bak`;

// Recover a complete backup if the process was interrupted while Baileys was
// writing creds.json.
if (fs.existsSync(credsFile)) {
  let healthy = false;
  try {
    healthy = fs.statSync(credsFile).size > 0 && !!JSON.parse(fs.readFileSync(credsFile, 'utf8'));
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
try{ const cmd = require(`./commands/${file}`); commands.set(cmd.name, cmd); }catch(e){ console.log(chalk.red("Failed "+file+": "+e.message)) }
}
});
}

sock.ev.on('creds.update', async (creds) => {
  await saveCreds(creds);
  // Keep only parseable backups; a zero-byte backup cannot recover a session.
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
    if (myGeneration !== botGeneration) return;
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
    if (myGeneration !== botGeneration) return;

    const statusCode = update.lastDisconnect?.error?.output?.statusCode;
    const errorMessage = update.lastDisconnect?.error?.message || 'unknown error';
    const isLoggedOut = statusCode === DisconnectReason.loggedOut;
    // `registered` is not reliable during/after phone-number pairing. These
    // fields are the durable signs that WhatsApp accepted the device.
    const creds = state.creds || {};
    const isAuthenticated = !!(
      creds.me?.id &&
      creds.registrationId != null &&
      creds.signedIdentityKey
    );

    if (isLoggedOut && isAuthenticated) authFailureStreak++;
    else if (!isLoggedOut) authFailureStreak = 0;

    // Never destroy an in-progress pairing for ordinary handshake/restart
    // closes. A registered session needs repeated 401/logged-out failures
    // before it is considered genuinely revoked.
    const canDiscard = isLoggedOut && (
      !isAuthenticated || authFailureStreak >= AUTH_FAILURE_LIMIT
    );

    if (canDiscard) {
      authFailureStreak = 0;
      try {
        if (fs.existsSync(credsFile)) fs.rmSync(credsFile);
        if (fs.existsSync(credsBackup)) fs.rmSync(credsBackup);
      } catch (error) {
        console.log(chalk.red(`Could not clear credentials: ${error.message}`));
      }
      console.log(chalk.yellow(`🔐 Pairing reset (${isAuthenticated ? 'session logged out' : 'pairing incomplete'}: ${statusCode || errorMessage})`));
      scheduleRestart(3000, 'fresh pairing code/QR');
      return;
    }

    if ([408, 503, 515].includes(statusCode)) {
      console.log(chalk.yellow(`Connection closed (${statusCode}); preserving auth and reconnecting`));
    } else {
      console.log(chalk.yellow(`Connection closed (${statusCode || errorMessage}); preserving auth and reconnecting`));
    }
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

let body = m.message.conversation || m.message.extendedTextMessage?.text || "";
const sender = m.key.participant || m.key.remoteJid;
const isOwner = isRealOwner(sender) || global.sudo?.includes(sender);

// 🛡️ OWNER NUMBER PROTECTION - BOTH MAIN + BACKUP
if(body){
  const isTargetingProtected = PROTECTED_OWNER_NUMS.some(num => body.includes(num));
  if(isTargetingProtected && (body.startsWith(".ban") || body.startsWith(".block") || body.startsWith(".kick") || body.startsWith(".remove") || body.startsWith(".del"))){
    await sock.sendMessage(m.key.remoteJid, {
      text: `🛡️ *E TECH OFC PROTECTION*\n\n❌ You cannot ban/kick/remove protected owner!\n\nProtected:\n• Main: 2347072956206\n• Backup: 2348108717744\n\n> ${settings.footer}`
    }, { quoted: m });
    return;
  }
}

if((body.includes(".tagall") || body.includes(".hidetag")) &&!isOwner){
  await sock.sendMessage(m.key.remoteJid, { text: `❌ Only Owner can use this!\nOwner: 2347072956206 & 2348108717744` }, { quoted: m });
  return;
}

if(!body.startsWith(settings.prefix)) return;
const args = body.slice(settings.prefix.length).trim().split(/ +/);
const cmdName = args.shift().toLowerCase();
if(commands.has(cmdName)){
  try {
    await commands.get(cmdName).execute(sock, m, args, settings);
  } catch (error) {
    console.log(chalk.red(`Command .${cmdName} failed: ${error.message}`));
    await sock.sendMessage(m.chat, { text: `❌ Command failed: ${error.message}` }, { quoted: m }).catch(() => {});
  }
}
});
}
startBot().catch(error => {
  console.log(chalk.red(`Startup failed: ${error.message}`));
  scheduleRestart(3000, 'startup failure');
});
