const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const settings = require('./settings');

const subMenus = {
  // MAIN MENU submenus (for.menu)
  "1": `╭───◐\n│ 👑 OWNER MENU\n╰───◐\n╭───◐\n│.restart\n│.broadcast\n│.block\n│.unblock\n│.setpp\n╰───◐\n> ${settings.footer}`,
  "2": `╭───◐\n│ 🌐 SOCIAL MENU\n╰───◐\n╭───◐\n│.tiktok\n│.insta\n│.fb\n│.ytmp4\n│.play\n╰───◐\n> ${settings.footer}`,
  "3": `╭───◐\n│ 🤖 AI MENU\n╰───◐\n╭───◐\n│.ai\n│.gpt\n│.gemini\n│.imagine\n╰───◐\n> ${settings.footer}`,
  "4": `╭───◐\n│ 👥 GROUP MENU\n╰───◐\n╭───◐\n│.tagall\n│.kick\n│.add\n│.promote\n│.demote\n╰───◐\n> ${settings.footer}`,
  "5": `╭───◐\n│ 🛠️ TOOLS MENU\n╰───◐\n╭───◐\n│.sticker\n│.toimg\n│.url\n│.calc\n╰───◐\n> ${settings.footer}`,
  "6": `╭───◐\n│ 📚 EDUCATION MENU\n╰───◐\n╭───◐\n│.define\n│.translate\n│.wikipedia\n╰───◐\n> ${settings.footer}`,
  "7": `╭───◐\n│ 📢 CHANNEL MENU\n╰───◐\n╭───◐\n│.channel\n│.follow\n╰───◐\n> ${settings.footer}`,

  // ALIVE submenus (for.alive)
  "alive1": `🏠 MAIN MENU - Type.menu`,
  "alive2": `🤖 CREATE BOT - Contact ${settings.ownerNumber} to create your own E TECH bot`,
  "alive3": `⚡ CHECK PING - Type.ping to check speed`
};

async function startBot() {
const { state, saveCreds } = await useMultiFileAuthState(settings.sessionName);
const sock = makeWASocket({ auth: state, printQRInTerminal: true });

const commands = new Map();
const cmdPath = path.join(__dirname, 'commands');
if(fs.existsSync(cmdPath)){
fs.readdirSync(cmdPath).forEach(file => {
if(file.endsWith('.js')){
const cmd = require(`./commands/${file}`);
commands.set(cmd.name, cmd);
}
});
}

sock.ev.on('creds.update', saveCreds);

sock.ev.on('messages.upsert', async ({ messages }) => {
const m = messages[0];
if(!m.message) return;
let body = m.message.conversation || m.message.extendedTextMessage?.text || "";
const isReply = m.message.extendedTextMessage?.contextInfo?.quotedMessage;
const quotedText = isReply? JSON.stringify(m.message.extendedTextMessage.contextInfo.quotedMessage) : "";

// HANDLE REPLY NUMBERS 1-7
if(/^[1-7]$/.test(body.trim()) && quotedText.includes("Reply Number")){
  const num = body.trim();
  let replyText = subMenus[num];

  // Check if it's alive menu (has I AM ALIVE)
  if(quotedText.includes("I AM ALIVE")){
    if(num==="1") replyText = subMenus["alive1"];
    if(num==="2") replyText = subMenus["alive2"];
    if(num==="3") replyText = subMenus["alive3"];
    // for alive, also send main menu
    if(num==="1"){
      await commands.get("menu")?.execute(sock, m, [], settings);
      return;
    }
  }

  await sock.sendMessage(m.chat, {
    image: { url: settings.menuImage },
    caption: replyText
  }, { quoted: m });
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
