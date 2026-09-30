module.exports = {
name: "alive",
execute: async (sock, m, args, settings) => {

const aliveText = `
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
│ VERSION - E TECH V1.0
│ COMMANDS - 103
│ PREFIX - [ . ]
│ ACTIVE BOTS - 2993
│ WEB - etechofc.vercel.app
│ MEDIA - ${settings.ownerNumber}
──────────────────❖

╭─「 Reply Number ⤵️ 」
│ 1️⃣ MAIN MENU
│ 2️⃣ CREATE BOT
│ 3️⃣ CHECK PING
╰─────────────────❖

> Powered by E TECH OFC
`;

await sock.sendMessage(m.chat, {
image: { url: settings.aliveImage },
caption: aliveText
}, { quoted: m });
}
}
