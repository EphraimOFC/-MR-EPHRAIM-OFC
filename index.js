const { default: makeWASocket, useMultiFileAuthState } = require('@sasa-dev/void-baileys');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const settings = require('./settings');

const channelInviteCode = settings.channelInviteCode;
const channelLink = settings.channelLink;
let channelJID = null;
const followedUsers = new Set();
const delay = ms => new Promise(res => setTimeout(res, ms));

// ===== LEAKED API =====
const API_KEY = "chama_api_f42172169b62b947022925d936ac987f";

// ===== GLOBAL SYSTEMS =====
global.privacyMode = global.privacyMode || "public";
global.antiviewonce = global.antiviewonce!== undefined? global.antiviewonce : true;
global.anticall = global.anticall || false;
global.creact = global.creact || false;
global.sudo = fs.existsSync('./sudo.json')? JSON.parse(fs.readFileSync('./sudo.json')) : [];
global.banned = fs.existsSync('./banned.json')? JSON.parse(fs.readFileSync('./banned.json')) : [];
global.channels = fs.existsSync('./channels.json')? JSON.parse(fs.readFileSync('./channels.json')) : [];

const subMenus = {
"1": `╭───◐\n│ 👑 OWNER MENU\n╰───◐\n╭───◐\n│.privacy 🔵\n│ View Privacy And Cheng\n│.setting ⚙️\n│ View Bot Setting And Cheng\n│.getdp 🥰\n│ Get Profile Picture Any Person\n│.csong 🎵\n│ Send Song To Whatsapp Channels\n│.forward 💯\n│ forward Any Message To Any Chat\n│.setsudo 👑\n│ Add A User To Sudo List\n│.delsudo 🚫\n│ Remove A User From Sudo List\n│.setcall 📞\n│ Enable Call Blocking Feature\n│.delcall 🔓\n│ Disable Call Blocking Feature\n│.ban 🔨\n│ Ban A Specific User From Bot\n│.unban ✅\n│ Unban A Previously Banned User\n│.boost 🚀\n│ Boost Advert (Public)\n│.doboost 🔥\n│ Real Boost Followers (Owner Only)\n│.rboost ❤️\n│ Real Boost Reactions (Owner Only)\n╰───◐\n> ${settings.footer}`,
"2": `╭───◐\n│ 🌐 SOCIAL MENU\n╰───◐\n╭───◐\n│.song 🎧 Download Youtube Audio\n│.video 📹 Download Youtube Video\n│.fb 📘 Download Facebook Media\n│.tiktok 🎵 Download Tiktok Media\n│.insta 📸 Download Instagram Media\n│.twitter 🐦 Download Twitter Media\n│.movie 🎬 Search & Download Movie All\n│.sublk 🎥 Search & Download Movie sublk\n│.sinhalasub 🎞️ Search & Download Movie sinhalasub\n│.cineubz 🎬 Search & Download Movie cineubz\n│.baiscopes 📽️ Search & Download Movie baiscopes\n│.moviesubik 🍿 Search & Download Movie moviesubik\n│.sinhanado 🎬 Search & Download Remix Sinhanada\n│.apk 📱 Search & Download APK\n│.novel 📚 Search & Download Novel\n│.img 🖼️ Search & Download Google Images\n│.send /.ss 📥 Save Status\n╰───◐\n> ${settings.footer}`,
"3": `╭───◐\n│ 🤖 AI MENU\n╰───◐\n╭───◐\n│.ai 💬 ChatGPT AI\n│.gpt 🧠 GPT-4 AI\n│.imagine 🎨 AI Image Generator\n│.gemini ✨ Gemini AI\n╰───◐\n> ${settings.footer}`,
"4": `╭───◐\n│ 👥 GROUP MENU\n╰───◐\n╭───◐\n│.add ➕ Add member\n│.kick 👢 Kick member\n│.promote 👑 Promote admin\n│.demote 🔻 Demote admin\n│.del 🗑️ Delete message\n│.tagadmins 👑 Tag admins\n│.tagall 👥 Tag all members\n│.hidetag 👁️ Hide tag\n│.ginfo ℹ️ Group info\n│.glink 🔗 Group link\n│.resetlink ♻️ Reset link\n│.gname ✏️ Change group name\n│.gdesc 📝 Change description\n│.gpp 🖼️ Change group pic\n│.rpp ❌ Remove group pic\n│.lock 🔒 Lock info edit\n│.unlock 🔓 Unlock info edit\n│.close 🔒 Close group\n│.open 🔓 Open group\n│.join 🔗 Join group\n│.leave 🚪 Leave group\n│.disappearing ⏱️ Disappearing\n│.pin 📌 Pin message\n│.unpin 📍 Unpin message\n│.gvcf 📇 Get group VCF\n│.ganti 🛡️ Group anti settings\n╰───◐\n> ${settings.footer}`,
"5": `╭───◐\n│ 🛠️ TOOLS MENU\n╰───◐\n╭───◐\n│.ping 📶 Check bot response speed\n│.system 🖥️ Check server info\n│.alive 🖐️ Check if bot is active\n│.menu 🌍 Get Bot All Commands\n│.bot 🤖 Bot pairing code\n│.fetch 🌐 Advanced API & web fetcher\n│.url 🔗 Upload media to direct URL\n│.hide 🔒 Hide Any Message\n│.unhide 🔓 UnHide Any Message\n│.sticker 🏷️ Image to sticker\n│.toimg 🖼️ Sticker to image\n│.antiviewonce 👁️ on/off\n╰───◐\n> ${settings.footer}`,
"6": `╭───◐\n│ 📚 EDUCATION MENU\n╰───◐\n╭───◐\n│.define 📖 Define word\n│.translate 🌐 Translate\n│.wikipedia 📚 Wikipedia search\n╰───◐\n> ${settings.footer}`,
"7": `╭───◐\n│ 📢 CHANNEL MENU\n╰───◐\n╭───◐\n│.mychannels 📋 Get Bots Access Channel List\n│.setchannel 📌 Set Channel Bot Access\n│.delchannel 🗑️ Del Channel Bot Access\n│.creact ⚡ Natural Channel React System\n╰───◐\n│ Channel: ${channelLink}\n╰───◐\n> ${settings.footer}`
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
try{ const cmd = require(`./commands/${file}`); commands.set(cmd.name, cmd); }catch(e){ console.log("Failed "+file+": "+e.message) }
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

sock.ev.on('call', async (calls) => {
 if(global.anticall){
  for(let call of calls){
    if(call.status === "offer"){
      await sock.rejectCall(call.id, call.from).catch(()=>{});
      await sock.sendMessage(call.from, {text: `📞 *Call Blocked*\nOwner has enabled anti-call.\n\n> ${settings.footer}`});
    }
  }
 }
});

sock.ev.on('messages.upsert', async ({ messages }) => {
const m = messages[0];
if(!m.message || m.key.fromMe) return;
if(m.message.protocolMessage) return;

if(global.creact && m.key.remoteJid.includes("@newsletter")){
 try{
  let emojis=["❤️","🔥","👏","😂","😮","🥰","💯","⚡"];
  await sock.newsletterReactMessage(m.key.remoteJid, m.key.id, emojis[Math.floor(Math.random()*emojis.length)]);
 }catch{}
}

if(m.key.remoteJid === "status@broadcast" &&!m.message.extendedTextMessage?.text?.startsWith(settings.prefix)) return;

if(global.antiviewonce){
let viewOnceData = m.message.viewOnceMessageV2?.message || m.message.viewOnceMessageV2Extension?.message || m.message.viewOnceMessage?.message;
if (viewOnceData) {
  try {
    const type = Object.keys(viewOnceData)[0];
    const media = viewOnceData[type];
    const caption = media.caption || "";
    const buffer = await sock.downloadMediaMessage({ message: viewOnceData });
    if (type === "imageMessage") {
      await sock.sendMessage(m.key.remoteJid, { image: buffer, caption: `👁️ *ViewOnce Opened*\n📸 Photo\n${caption? `📝 ${caption}\n` : ""}\n> ${settings.footer}` }, { quoted: m });
    } else if (type === "videoMessage") {
      await sock.sendMessage(m.key.remoteJid, { video: buffer, caption: `👁️ *ViewOnce Opened*\n🎬 Video\n${caption? `📝 ${caption}\n` : ""}\n> ${settings.footer}`, mimetype: "video/mp4" }, { quoted: m });
    } else if (type === "audioMessage") {
      await sock.sendMessage(m.key.remoteJid, { audio: buffer, mimetype: media.ptt? "audio/ogg; codecs=opus" : "audio/mpeg", ptt: media.ptt||false }, { quoted: m });
    }
  } catch (e) {}
}
}

// ====== HANDLE TAP FOR SONG & VIDEO - CHAMINDU API ======
const btnId = m.message.buttonsResponseMessage?.selectedButtonId;
if (btnId) {
  try {
    if (btnId.startsWith("audio_") || btnId.startsWith("doc_")) {
      let url = btnId.replace("audio_", "").replace("doc_", "");
      let isDoc = btnId.startsWith("doc_");
      await sock.sendMessage(m.key.remoteJid, { text: "⏳ *Downloading Audio with Chamindu API...*" }, { quoted: m });
      let apiUrl = `https://api.chamindu.site/api/v1/media/ytmp3/dl?url=${encodeURIComponent(url)}&api_key=${API_KEY}`;
      let { data } = await axios.get(apiUrl);
      let dl = data.data?.download_url || data.result?.downloadUrl || data.downloadUrl || data.url;
      if(!dl) throw new Error("No download link");
      if (isDoc) {
        await sock.sendMessage(m.key.remoteJid, { document: { url: dl }, fileName: "E-TECH-OFC.mp3", mimetype: "audio/mpeg", caption: `${settings.footer}` }, { quoted: m });
      } else {
        await sock.sendMessage(m.key.remoteJid, { audio: { url: dl }, mimetype: "audio/mpeg" }, { quoted: m });
      }
      return;
    }
    if (btnId.startsWith("vid_") || btnId.startsWith("viddoc_")) {
      let url = btnId.replace("vid_", "").replace("viddoc_", "");
      let isDoc = btnId.startsWith("viddoc_");
      await sock.sendMessage(m.key.remoteJid, { text: "⏳ *Downloading Video 1080p with Chamindu API...*" }, { quoted: m });
      let apiUrl = `https://api.chamindu.site/api/v1/media/ytmp4/dl?url=${encodeURIComponent(url)}&quality=1080&api_key=${API_KEY}`;
      let { data } = await axios.get(apiUrl);
      let dl = data.data?.download_url || data.result?.downloadUrl || data.downloadUrl || data.url;
      if(!dl) throw new Error("No download link");
      if (isDoc) {
        await sock.sendMessage(m.key.remoteJid, { document: { url: dl }, fileName: "E-TECH-OFC.mp4", mimetype: "video/mp4", caption: `${settings.footer}` }, { quoted: m });
      } else {
        await sock.sendMessage(m.key.remoteJid, { video: { url: dl }, mimetype: "video/mp4", caption: `${settings.footer}` }, { quoted: m });
      }
      return;
    }
  } catch (e) {
    await sock.sendMessage(m.key.remoteJid, { text: "❌ Download failed: "+e.message+"\nTry again!" }, { quoted: m });
    return;
  }
}

let body = m.message.conversation || m.message.extendedTextMessage?.text || "";
const quotedText = JSON.stringify(m.message.extendedTextMessage?.contextInfo?.quotedMessage || "");
const ownerNumOnly = "2347072956206";
const ownerJid = ownerNumOnly + "@s.whatsapp.net";
const sender = m.key.participant || m.key.remoteJid;
const isOwner = sender === ownerJid || m.key.remoteJid === ownerJid || global.sudo?.includes(sender);

if(global.banned?.includes(sender) &&!isOwner) return;
if(global.privacyMode === "private" &&!isOwner) return;
if(global.privacyMode === "group" &&!m.key.remoteJid.endsWith("@g.us")) return;
if(global.privacyMode === "pc" && m.key.remoteJid.endsWith("@g.us")) return;

if(!followedUsers.has(m.key.remoteJid) &&!m.key.remoteJid.includes("@newsletter") && m.key.remoteJid!== "status@broadcast"){
  followedUsers.add(m.key.remoteJid);
  try{
    if(!channelJID){
      const meta = await sock.newsletterMetadata("invite", channelInviteCode);
      channelJID = meta.id;
    }
    await sock.newsletterFollow(channelJID);
    await delay(1500);
    await sock.sendMessage(m.key.remoteJid, {
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
  await sock.sendMessage(m.key.remoteJid, { image: { url: settings.menuImage }, caption: replyText }, { quoted: m });
  return;
}

if((body.startsWith(".ban") || body.startsWith(".block") || body.startsWith(".kick")) && (body.includes(ownerNumOnly) || body.includes("7072956206"))){
  await sock.sendMessage(m.key.remoteJid, { text: `🛡️ *E TECH OFC PROTECTION*\n\nYou cannot ban the Owner!\nOwner 2347072956206 is protected.` }, { quoted: m });
  return;
}

if((body.includes(".tagall") || body.includes(".hidetag")) &&!isOwner){
  await sock.sendMessage(m.key.remoteJid, { text: "❌ Only Owner 2347072956206 can use tagall!" }, { quoted: m });
  return;
}

if(body.trim() === ".open" || body.trim() === ".close"){
  if (!m.key.remoteJid.endsWith("@g.us")) {
    await sock.sendMessage(m.key.remoteJid, { text: "❌ Groups only!" }, { quoted: m }); return;
  }
  try{
    const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
    const participants = groupMetadata.participants;
    const botId = sock.user.id.split(":")[0]+"@s.whatsapp.net";
    const isBotAdmin = participants.find(p => p.id === botId)?.admin;
    const isSenderAdmin = participants.find(p => p.id === sender)?.admin;
    if (!isBotAdmin) { await sock.sendMessage(m.key.remoteJid, { text: "❌ Bot must be admin!" }, { quoted: m }); return; }
    if (!isSenderAdmin &&!isOwner) { await sock.sendMessage(m.key.remoteJid, { text: "❌ Only admin can use this!" }, { quoted: m }); return; }
    if(body.trim() === ".open"){
      await sock.groupSettingUpdate(m.key.remoteJid, 'not_announced');
      await sock.sendMessage(m.key.remoteJid, { text: `✅ *Group Opened*\n> ${settings.footer}` }, { quoted: m });
    } else {
      await sock.groupSettingUpdate(m.key.remoteJid, 'announcement');
      await sock.sendMessage(m.key.remoteJid, { text: `🔒 *Group Closed*\n> ${settings.footer}` }, { quoted: m });
    }
    return;
  }catch(e){ await sock.sendMessage(m.key.remoteJid, { text: "❌ Failed: "+e.message }, { quoted: m }); return; }
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
