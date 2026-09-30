const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

module.exports = {
name: "pair",
execute: async (sock, m, args, settings) => {
if(!args[0]) return sock.sendMessage(m.chat, { text: `*E TECH OFC PAIR SYSTEM*\n\nUsage:.pair 2347072956206\n\nPut number with country code, no + sign\n\nExample:.pair 2348012345678\n\n> ${settings.footer}` }, { quoted: m });

let number = args[0].replace(/[^0-9]/g, '');
if(number.length < 10) return sock.sendMessage(m.chat, { text: "❌ Invalid number. Example:.pair 2347072956206" }, { quoted: m });

await sock.sendMessage(m.chat, { text: `⏳ Generating pair code for ${number}...\nUsing temp/ folder - your main session safe...` }, { quoted: m });

try {
  const tempId = `temp/${Date.now()}_${number}`;
  const tempPath = path.join(__dirname, '..', tempId);
  fs.mkdirSync(tempPath, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(tempPath);
  const tempSock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: { level: 'silent' },
    browser: ["E TECH OFC", "Chrome", "1.0.0"]
  });

  tempSock.ev.on('creds.update', saveCreds);
  await new Promise(r => setTimeout(r, 3000));

  let code = await tempSock.requestPairingCode(number);
  code = code.match(/.{1,4}/g).join("-");

  await sock.sendMessage(m.chat, {
    image: { url: settings.menuImage },
    caption: `✅ *E TECH OFC PAIR CODE*\n\n*Number:* ${number}\n*Code:* *${code}*\n\n1. Open WhatsApp > Linked Devices\n2. Link a device > Link with phone number\n3. Enter: ${code}\n\nExpires in 60 seconds!\n\n> ${settings.footer}\n> Channel: ${settings.channelLink}`
  }, { quoted: m });

  // Auto-delete temp after 70s - MAIN BOT session/ still online with 2347072956206
  setTimeout(() => {
    try { fs.rmSync(tempPath, { recursive: true, force: true }); } catch {}
  }, 70000);

} catch(e){
  console.log(e);
  await sock.sendMessage(m.chat, { text: `❌ Failed: ${e.message}\nTry again after 2 mins.` }, { quoted: m });
}
}
}
