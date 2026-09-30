module.exports = {
name: "alive",
execute: async (sock, m, args, settings) => {
const text = `
👋──────────○
│ ╎ ╎ ╎
│ ╎ ☆°•.✦
│ ✠
✦ E TECH OFC ○○─𝄞

──────────────────❖
│ 👋 I AM ALIVE NOW
──────────────────❖

──────────────────❖
│ OWNER - MR EPHRAIM OFC
│ VERSION - 5.2.0
│ COMMANDS - 103
│ PREFIX - [. ]
│ ACTIVE BOTS - 2993
│ WEB - etechofc.vercel.app
│ MEDIA - ${settings.ownerNumber}
──────────────────❖

╭─「 Reply Number ⤵️ 」
│ 1️⃣ MAIN MENU
│ 2️⃣ CREATE BOT
│ 3️⃣ CHECK PING
╰─────────────────❖

> etechofc.vercel.app </> Powered by E TECH OFC
`;
await sock.sendMessage(m.chat, { image: { url: settings.aliveImage }, caption: text }, { quoted: m });
}
}
