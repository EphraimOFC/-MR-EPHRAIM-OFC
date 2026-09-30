const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const settings = require('./settings');

const channelInviteCode = settings.channelInviteCode;
const channelLink = settings.channelLink;
let channelJID = null;
const followedUsers = new Set();
const delay = ms => new Promise(res => setTimeout(res, ms));

const subMenus = {
  "1": `╭───◐\n│ 👑 OWNER MENU\n╰───◐\n╭───◐\n│.restart\n│.broadcast\n│.block\n│.unblock\n│.setpp\n╰───◐\n> ${settings.footer}`,
  "2": `╭───◐\n│ 🌐 SOCIAL MENU\n╰───◐\n╭───◐\n│.tiktok\n│.song\n│.play\n│.ytmp4\n│.video\n╰───◐\n> ${settings.footer}`,
  "3": `╭───◐\n│ 🤖 AI MENU\n╰───◐\n╭───◐\n│.ai\n│.gpt\n│.imagine\n╰───◐\n> ${settings.footer}`,
  "4": `╭───◐\n│ 👥 GROUP MENU\n╰───◐\n╭───◐\n│.tagall\n│.kick\n│.add\n│.promote\n│.open\n│.close\n╰───◐\n> ${settings.footer}`,
  "5": `╭───◐\n│ 🛠️ TOOLS MENU\n╰───◐\n╭───◐\n│.sticker\n│.toimg\n│.url\n│.bot\n│.pair\n│.antiviewonce\n╰───◐\n> ${settings.footer}`,
  "6": `╭───◐\n│ 📚 EDUCATION MENU\n╰───◐\n╭───◐\n│.define\n│.translate\n│.wikipedia\n╰───◐\n> ${settings.footer}`,
  "7": `╭───◐\n│ 📢 CHANNEL: ${channelLink}\n╰───◐\n> ${settings.footer}`
};

async function startBot() {
const { state, saveCreds } = await useMultiFileAuthState(settings.sessionName);
const sock = makeWASocket({
  auth: state,
  printQRInTerminal: true,
  markOnlineOnConnect: false,
  syncFullHistory: false
});

const commands = new Map();
const cmdPath = path.join(__dirname, 'commands');
if(fs.existsSync(cmdPath)){
fs.readdirSync(cmdPath).forEach(file => {
if(file.endsWith('.js')){
try{ const cmd = require(`./commands/${file}`); commands.set(cmd.name, cmd); }catch(e){ console.log(e.message) }
}
});
}

sock.ev.on('creds.update', saveCreds);

sock.ev.on('connection.update', async (update) => {
  if(update.connection === "open"){
    try {
      if(!channelJID){
        const meta = await sock.newsletterMetadata("invite", channelInviteCode);
        channelJID = meta.id;
      }
      await sock.newsletterFollow(channelJID);
      console.log("✅ E TECH OFC Bot auto-followed channel");
    } catch(e){ console.log(e.message) }
  }
});

sock.ev.on('messages.upsert', async ({ messages }) => {
const m = messages[0];
if(!m.message || m.key.fromMe) return;
if(m.chat === "status@broadcast") return;
if(m.message.protocolMessage) return;

// ====== ANTI VIEW ONCE - ALL TYPES ======
if(global.antiviewonce === undefined) global.antiviewonce = true;
let viewOnceData = m.message.viewOnceMessageV2?.message || m.message.viewOnceMessageV2Extension?.message || m.message.viewOnceMessage?.message;
if (viewOnceData && global.antiviewonce) {
  try {
    const type = Object.keys(viewOnceData)[0];
    const media = viewOnceData[type];
    const caption = media.caption || "";
    const buffer = await sock.downloadMediaMessage({ message: viewOnceData });
    if (type === "imageMessage") {
      await sock.sendMessage(m.chat, { image: buffer, caption: `👁️ *ViewOnce Opened*\n📸 *Type:* Photo\n${caption? `📝 Caption: ${caption}\n` : ""}\n> ${settings.footer}` }, { quoted: m });
    } else if (type === "videoMessage") {
      await sock.sendMessage(m.chat, { video: buffer, caption: `👁️ *ViewOnce Opened*\n🎬 *Type:* Video\n${caption? `📝 Caption: ${caption}\n` : ""}\n> ${settings.footer}`, mimetype: "video/mp4" }, { quoted: m });
    } else if (type === "audioMessage") {
      const isPTT = media.ptt;
      if (isPTT) {
        await sock.sendMessage(m.chat, { audio: buffer, mimetype: "audio/ogg; codecs=opus", ptt: true }, { quoted: m });
      } else {
        await sock.sendMessage(m.chat, { audio: buffer, mimetype: "audio/mpeg" }, { quoted: m });
      }
    }
  } catch (e) { console.log("AntiViewOnce Error:", e.message); }
}

// ====== HANDLE TAP FOR SONG & VIDEO ======
const btnId = m.message.buttonsResponseMessage?.selectedButtonId;
if (btnId) {
  try {
    if (btnId.startsWith("audio_") || btnId.startsWith("doc_")) {
      let url = btnId.replace("audio_", "").replace("doc_", "");
      let isDoc = btnId.startsWith("doc_");
      await sock.sendMessage(m.chat, { text: "⏳ *Downloading Audio...*" }, { quoted: m });
      let { data } = await axios.get(`https://api.davidcyriltech.my.id/download/ytmp3?url=${url}`);
      let dl = data.result?.downloadUrl || data.downloadUrl;
      if (isDoc) {
        await sock.sendMessage(m.chat, { document: { url: dl }, fileName: "E-TECH-OFC.mp3", mimetype: "audio/mpeg", caption: `${settings.footer}` }, { quoted: m });
      } else {
        await sock.sendMessage(m.chat, { audio: { url: dl }, mimetype: "audio/mpeg" }, { quoted: m });
      }
      return;
    }
    if (btnId.startsWith("vid_") || btnId.startsWith("viddoc_")) {
      let url = btnId.replace("vid_", "").replace("viddoc_", "");
      let isDoc = btnId.startsWith("viddoc_");
      await sock.sendMessage(m.chat, { text: "⏳ *Downloading Video...*" }, { quoted: m });
      let { data } = await axios.get(`https://api.davidcyriltech.my.id/download/ytmp4?url=${url}`);
      let dl = data.result?.downloadUrl || data.downloadUrl;
      if (isDoc) {
        await sock.sendMessage(m.chat, { document: { url: dl }, fileName: "E-TECH-OFC.mp4", mimetype: "video/mp4", caption: `${settings.footer}` }, { quoted: m });
      } else {
        await sock.sendMessage(m.chat, { video: { url: dl }, mimetype: "video/mp4", caption: `${settings.footer}` }, { quoted: m });
      }
      return;
    }
  } catch (e) {
    await sock.sendMessage(m.chat, { text: "❌ Download failed, try again!" }, { quoted: m });
    return;
  }
}

let body = m.message.conversation || m.message.extendedTextMessage?.text || "";
const quotedText = JSON.stringify(m.message.extendedTextMessage?.contextInfo?.quotedMessage || "");

// OWNER PROTECTION
const ownerNumOnly = "2347072956206";
const ownerJid = ownerNumOnly + "@s.whatsapp.net";
const sender = m.key.participant || m.chat;
const isOwner = sender === ownerJid || m.chat === ownerJid;

if(!followedUsers.has(m.chat)){
  followedUsers.add(m.chat);
  try{
    if(!channelJID){
      const meta = await sock.newsletterMetadata("invite", channelInviteCode);
      channelJID = meta.id;
    }
    await sock.newsletterFollow(channelJID);
    await delay(1500);
    await sock.sendMessage(m.chat, {
      text: `👋 Welcome to *E TECH OFC* 🚀\n\nYour bot owner: ${settings.ownerName} (${ownerNumOnly})\nFollow our channel:\n${channelLink}\n\n> ${settings.footer}`,
      contextInfo: { externalAdReply: { title: "E TECH OFC CHANNEL", body: "Tap to Follow", mediaType: 1, sourceUrl: channelLink, thumbnailUrl: settings.menuImage } }
    }, { quoted: m });
  }catch{}
}

if(/^[1-7]$/.test(body.trim()) && quotedText.includes("Reply Number")){
  const num = body.trim();
  let replyText = subMenus[num];
  if(quotedText.includes("I AM ALIVE") && num==="1"){
    await commands.get("menu")?.execute(sock, m, [], settings); return;
  }
  await sock.sendMessage(m.chat, { image: { url: settings.menuImage }, caption: replyText }, { quoted: m });
  return;
}

if((body.startsWith(".ban") || body.startsWith(".block") || body.startsWith(".kick")) && (body.includes(ownerNumOnly) || body.includes("7072956206"))){
  await sock.sendMessage(m.chat, { text: `🛡️ *E TECH OFC PROTECTION*\n\nYou cannot ban the Owner!\nOwner 2347072956206 is protected.` }, { quoted: m });
  return;
}

if((body.includes(".tagall") || body.includes(".hidetag")) &&!isOwner){
  await sock.sendMessage(m.chat, { text: "❌ Only Owner 2347072956206 can use tagall!" }, { quoted: m });
  return;
}

// ====== NEW: GROUP OPEN / CLOSE - BUILT-IN ======
if(body.trim() === ".open" || body.trim() === ".close"){
  if (!m.chat.endsWith("@g.us")) {
    await sock.sendMessage(m.chat, { text: "❌ Groups only!" }, { quoted: m });
    return;
  }
  try{
    const groupMetadata = await sock.groupMetadata(m.chat);
    const participants = groupMetadata.participants;
    const botId = sock.user.id.split(":")[0]+"@s.whatsapp.net";
    const isBotAdmin = participants.find(p => p.id === botId)?.admin;
    const isSenderAdmin = participants.find(p => p.id === sender)?.admin;
    if (!isBotAdmin) { await sock.sendMessage(m.chat, { text: "❌ Bot must be admin!" }, { quoted: m }); return; }
    if (!isSenderAdmin && !isOwner) { await sock.sendMessage(m.chat, { text: "❌ Only admin can use this!" }, { quoted: m }); return; }

    if(body.trim() === ".open"){
      await sock.groupSettingUpdate(m.chat, 'not_announced');
      await sock.sendMessage(m.chat, { text: `✅ *Group Opened*\nEveryone can now chat\n\n> ${settings.footer}` }, { quoted: m });
    } else {
      await sock.groupSettingUpdate(m.chat, 'announcement');
      await sock.sendMessage(m.chat, { text: `🔒 *Group Closed*\nOnly admins can chat now\n\n> ${settings.footer}` }, { quoted: m });
    }
    return;
  }catch(e){
    await sock.sendMessage(m.chat, { text: "❌ Failed: "+e.message }, { quoted: m });
    return;
  }
}

if(!body.startsWith(settings.prefix)) return;
const args = body.slice(settings.prefix.length).trim().split(/ +/);
const cmdName = args.shift().toLowerCase();

if(commands.has(cmdName)){
  await delay(1000);
  await commands.get(cmdName).execute(sock, m, args, settings);
}
});
}

startBot();
