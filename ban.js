const fs = require('fs');
module.exports = {
name: "ban",
execute: async (sock, m, args, settings) => {
let jid = m.mentionedJid?.[0] || (m.message?.extendedTextMessage?.contextInfo?.participant) || args[0]?.replace(/[^0-9]/g,'')+"@s.whatsapp.net";
global.banned = global.banned||[];
if(!global.banned.includes(jid)) global.banned.push(jid);
fs.writeFileSync('./banned.json', JSON.stringify(global.banned));
await sock.sendMessage(m.chat, {text:`🚫 Banned: ${jid}\n> ${settings.footer}`}, {quoted: m});
}
}
