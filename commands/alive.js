const axios = require('axios');
module.exports = {
name: "alive",
execute: async (sock, m, args, settings) => {
const text = `
👋──────────○
│ ╎ ╎ ╎
│ ╎ ☆°•.✦
│ ✠
✦ *E TECH OFC* ○○─𝄞

──────────────────❖
│ 👋 *I AM ALIVE NOW*
──────────────────❖

──────────────────❖
│ 👑 OWNER - MR EPHRAIM OFC
│ 📞 MAIN - 2347072956206
│ 📞 BACKUP - 2348108717744
│ 🚀 VERSION - 2.0.0
│ 📜 COMMANDS - 55
│ ⚙️ PREFIX - [ ${settings.prefix} ]
│ 🤖 ACTIVE - 24/7 ONLINE
│ 🌐 WEB - ${settings.botLink}
──────────────────❖

╭─「 *Reply Number* ⤵️ 」
│ 1️⃣ MAIN MENU
│ 2️⃣ CREATE BOT
│ 3️⃣ CHECK PING
╰─────────────────❖

${settings.footer}
`;
try { await sock.sendMessage(m.key.remoteJid, { image: { url: settings.aliveImage }, caption: text }, { quoted: m }); } catch (e) { console.log('Alive image failed: '+e.message); await sock.sendMessage(m.key.remoteJid, { text }, { quoted: m }); }
}
}
