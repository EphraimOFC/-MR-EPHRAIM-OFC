const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const settings = require('./settings');

// --- E TECH OFC CHANNEL ---
const channelInviteCode = "0029VbCrylkDp2Q0MbaKpp16";
const channelLink = "https://whatsapp.com/channel/0029VbCrylkDp2Q0MbaKpp16";
let channelJID = null;
const followedUsers = new Set();

const subMenus = {
  "1": `╭───◐\n│ 👑 OWNER MENU - E TECH OFC\n╰───◐\n╭───◐\n│.restart\n│.broadcast\n│.block\n│.unblock\n│.setpp\n╰───◐\n> ${settings.footer}`,
  "2": `╭───◐\n│ 🌐 SOCIAL MENU\n╰───◐\n╭───◐\n│.tiktok\n│.play\n│.ytmp4\n│.insta\n│.fb\n╰───◐\n> ${settings.footer}`,
  "3": `╭───◐\n│ 🤖 AI MENU\n╰───◐\n╭───◐\n│.ai\n│.gpt\n│.imagine\n╰───◐\n> ${settings.footer}`,
  "4": `╭───◐\n│ 👥 GROUP MENU\n╰───◐\n╭───◐\n│.tagall\n│.kick\n│.add\n│.promote\n│.demote\n╰───◐\n> ${settings.footer}`,
  "5": `╭───◐\n│ 🛠️ TOOLS MENU\n╰───◐\n╭───◐\n│.sticker\n│.toimg\n│.url\n│.calc\n╰───◐\n> ${settings.footer}`,
  "6": `╭───◐\n│ 📚 EDUCATION MENU\n╰───◐\n╭───◐\n│.define\n│.translate\n│.wikipedia\n╰───◐\n> ${settings.footer}`,
  "7": `╭───◐\n│ 📢 CHANNEL MENU\n╰───◐\n╭───◐\n│ Join: ${channelLink}\n│ Web: etechofc.vercel.app\n╰───◐\n> ${settings.footer}`,
  "alive1": `🏠 MAIN MENU - Type.menu`,
  "alive2": `🤖 CREATE BOT - Your bot will also auto-follow E TECH OFC channel\nLink: ${channelLink}`,
  "alive3": `⚡ CHECK PING - Type.ping`
};

async function startBot() {
const { state, saveCreds } = await useMultiFileAuthState(settings.sessionName);
const sock = makeWASocket({ auth: state, printQRInTerminal: true });

const commands = new Map();
const cmdPath = path.join(__dirname, 'commands');
if(fs.existsSync(cmdPath)){
fs.readdirSync(cmdPath).forEach(file => {
if(file.endsWith('.js')){
try{
const cmd = require(`./commands/${file}`);
commands.set(cmd.name, cmd);
}catch{}
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
      console.log("✅ E TECH OFC Bot auto-followed channel:", channelJID);
    } catch(e){ console.log("Channel follow error:", e.message) }
  }
});

sock.ev.on('messages.upsert', async ({ messages }) => {
const m = messages[0];
if(!m.message || m.key.fromMe) return;
let body = m.message.conversation || m.message.extendedTextMessage?.text || "";
const quotedMsg = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
const quotedText = quotedMsg? JSON.stringify(quotedMsg) : "";

// AUTO FOLLOW FOR NEW USER (once)
if(!followedUsers.has(m.chat)){
  followedUsers.add(m.chat);
  try{
    if(!channelJID){
      const meta = await sock.newsletterMetadata("invite", channelInviteCode);
      channelJID = meta.id;
    }
    await sock.newsletterFollow(channelJID);
    await sock.sendMessage(m.chat, {
      text: `👋 Welcome to *E TECH OFC* 🚀\n\nYou are now connected to our official channel:\n${channelLink}\n\nTap follow for updates, new commands & giveaways!\n\n> Powered by E TECH OFC`,
      contextInfo: {
        externalAdReply: {
          title: "E TECH OFC OFFICIAL CHANNEL",
          body: "Tap to Follow - Don't miss updates",
          mediaType: 1,
          sourceUrl: channelLink,
          thumbnailUrl: "https://files.catbox.moe/nx66nl.jpeg"
        }
      }
    }, { quoted: m });
  }catch(e){}
}

// HANDLE REPLY NUMBERS 1-7
if(/^[1-7]$/.test(body.trim()) && quotedText.includes("Reply Number")){
  const num = body.trim();
  let replyText = subMenus[num];
  if(quotedText.includes("I AM ALIVE")){
    if(num==="1"){
      await commands.get("menu")?.execute(sock, m, [], settings);
      return;
    }
    if(num==="2") replyText = subMenus["alive2"];
    if(num==="3") replyText = subMenus["alive3"];
  }
  await sock.sendMessage(m.chat, { image: { url: settings.menuImage }, caption: replyText }, { quoted: m });
  return;
}

if(!body.startsWith(settings.prefix)) return;
const args = body.slice(settings.prefix.length).trim().split(/ +/);
const cmdName = args.shift().toLowerCase();
if(commands.has(cmdName)){
  await commands.get(cmdName).execute(sock, m, args, settings);
}
});
}

startBot();
}
