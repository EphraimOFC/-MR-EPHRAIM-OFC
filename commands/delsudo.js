const fs = require('fs');
module.exports = {
name: "delsudo",
execute: async (sock, m, args, settings) => {
let num = m.mentionedJid?.[0] || args[0]?.replace(/[^0-9]/g,'')+"@s.whatsapp.net";
global.sudo = global.sudo||[];
global.sudo = global.sudo.filter(x=> x!==num);
fs.writeFileSync('./sudo.json', JSON.stringify(global.sudo));
await sock.sendMessage(m.chat, {text:`❌ Removed from Sudo: ${num}\n> ${settings.footer}`}, {quoted: m});
}
}
