module.exports = {
name: "menu",
execute: async (sock, m, args, settings) => {
const total = 103;
const text = `
╭─○
│ ╎ E TECH OFC ✦
│ ✦ MR EPHRAIM OFC ༆
╰─○

╭───◐
│ 🏠 MAIN MENU
╰───◐

╭───◐
│ OWNER - ${settings.ownerName}
│ VERSION - E TECH V1.0
│ COMMANDS - ${total}
│ PREFIX - [ ${settings.prefix} ]
│ WEB - etechofc.vercel.app
│ MEDIA - ${settings.ownerNumber}
╰───◐

╭─「 Reply Number ⬇️ 」
│ 1️⃣ OWNER MENU
│ 2️⃣ SOCIAL MENU
│ 3️⃣ AI MENU
│ 4️⃣ GROUP MENU
│ 5️⃣ TOOLS MENU
│ 6️⃣ EDUCATION MENU
╰───◐

> ${settings.footer}
`;
await sock.sendMessage(m.chat, { image: { url: settings.menuImage }, caption: text }, { quoted: m });
}
}
