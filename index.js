const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const settings = require('./settings');

// === E TECH OFC CONFIG ===
const channelInviteCode = "0029VbCrylkDp2Q0MbaKpp16";
const channelLink = "https://whatsapp.com/channel/0029VbCrylkDp2Q0MbaKpp16";
let channelJID = null;
const followedUsers = new Set();
const delay = ms => new Promise(res => setTimeout(res, ms));

const subMenus = {
  "1": `╭───◐\n│ 👑 OWNER MENU - E TECH OFC\n╰───◐\n╭───◐\n│.restart\n│.broadcast\n│.block\n│.unblock\n│.setpp\n╰───◐\n> ${settings.footer}`,
  "2": `╭───◐\n│ 🌐 SOCIAL MENU\n╰───◐\n╭───◐\n│.tiktok\n│.song\n│.play\n│.ytmp4\n│.insta\n│.fb\n╰───◐\n> ${settings.footer}`,
  "3": `╭───◐\n│ 🤖 AI MENU\n╰───◐\n╭───◐\n│.ai\n│.gpt\n│.imagine\n╰───◐\n> ${settings.footer}`,
  "4": `╭───◐\n│ 👥 GROUP MENU\n╰───◐\n╭───◐\n│.tagall\n│.hidetag\n│.kick\n│.add\n│.promote\n│.demote\n╰───◐\n> ${settings.footer}`,
  "5": `╭───◐\n│ 🛠️ TOOLS MENU\n╰───◐\n╭───◐\n│.sticker\n│.toimg\n│.url\n│.calc\n│.owner\n╰───◐\n> ${settings.footer}`,
  "6": `╭───◐\n│ 📚 EDUCATION MENU\n╰───◐\n╭───◐\n│.define\n│.translate\n│.wikipedia\n╰───◐\n> ${settings.footer}`,
  "7": `╭───◐\n│ 📢 CHANNEL MENU\n╰───◐\n╭───◐\n│ Join: ${channelLink}\n│ Web: etechofc.vercel.app\n╰───◐\n> ${settings.footer}`,
  "alive1": `🏠 MAIN MENU - Type .menu`,
  "alive2": `🤖 CREATE BOT - Your bot auto-follows E TECH OFC channel\n${channelLink}`,
  "alive3": `⚡ CHECK PING - Type .ping`
};

async function startBot() {
const { state, saveCreds } = await useMultiFileAuthState(settings.sessionName);
const sock = makeWASocket({ 
  auth: state, 
  printQRInTerminal: true,
  markOnlineOnConnect: false, // Anti-ban: don't always show online
  syncFullHistory: false
});

const commands = new Map();
const cmdPath = path.join(__dirname, 'commands');
if(fs.existsSync(cmdPath)){
fs.readdirSync(cmdPath).forEach(file => {
if(file.endsWith('.js')){
try{
const cmd = require(`./commands/${file}`);
commands.set(cmd.name, cmd);
}catch(e){ console.log("Failed to load", file, e.message) }
}
});
}

sock.ev.on('creds.update', saveCreds);

sock.ev.on('connection.update', async (update) => {
  if(update.connection === "open"){
    try {
      if(!channelJID){
        const
