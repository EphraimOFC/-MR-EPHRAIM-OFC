module.exports = {
name: "menu",
execute: async (sock, m, args, settings) => {
const total = 103;
const text = `
╭─○
│ ╎ *E TECH OFC* ✦
│ ✦ *MR EPHRAIM OFC* ༆
╰─○

╭───◐
│ 🏠 *MAIN MENU*
╰───◐

╭───◐
│ 👑 OWNER - ${settings.ownerName}
│ 📞 MAIN - 2347072956206
│ 📞 BACKUP - 2348108717744
│ 🚀 VERSION - E TECH V2.0
│ 📜 COMMANDS - ${total}
│ ⚙️ PREFIX - [ ${settings.prefix} ]
│ 🌐 WEB - ${settings.botLink}
╰───◐

╭─「 *Reply Number* ⬇️ 」
│ 1️⃣ OWNER MENU
│ 2️⃣ SOCIAL MENU
│ 3️⃣ AI MENU
│ 4️⃣ GROUP MENU
│ 5️⃣ TOOLS MENU
│ 6️⃣ EDUCATION MENU
│ 7️⃣ CHANNEL MENU
╰───◐

${settings.footer}
`;
try { await sock.sendMessage(m.key.remoteJid, { image: { url: settings.menuImage }, caption: text }, { quoted: m }); } catch (e) { console.log('Menu image failed: '+e.message); await sock.sendMessage(m.chat, { text }, { quoted: m }); }
}
}
