const fs = require('fs');
module.exports = {
name: "unban",
execute: async (sock, m, args, settings) => {
let jid = m.mentionedJid?.[0] || args[0]?.replace(/[^0-9]/g,'')+"@s.whatsapp.net";
global.banned = global.banned||[];
global.banned = global.banned.filter(x=> x!==jid);
fs.writeFileSync('./banned.json', JSON.stringify(global.banned));
await sock.sendMessage(m.chat, {text:`✅ Unbanned: ${jid}\n> ${settings.footer}`}, {quoted: m});
}
}
