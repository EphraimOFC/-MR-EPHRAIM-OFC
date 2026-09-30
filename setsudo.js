const fs = require('fs');
module.exports = {
name: "setsudo",
execute: async (sock, m, args, settings) => {
let num = m.mentionedJid?.[0] || args[0]?.replace(/[^0-9]/g,'')+"@s.whatsapp.net";
if(!num || num=="@s.whatsapp.net") return sock.sendMessage(m.chat, {text:"❌ Tag or give number"}, {quoted: m});
global.sudo = global.sudo||[];
if(!global.sudo.includes(num)) global.sudo.push(num);
fs.writeFileSync('./sudo.json', JSON.stringify(global.sudo));
await sock.sendMessage(m.chat, {text:`👑 Added to Sudo: ${num}\n> ${settings.footer}`}, {quoted: m});
}
}
