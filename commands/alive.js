const fs = require('fs');
const path = require('path');

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
│ 🚀 VERSION - 2.0.0
│ 📜 COMMANDS - 55
│ ⚙️ PREFIX - [ ${settings.prefix} ]
│ 🤖 ACTIVE - 24/7 ONLINE
│ 📱 ACCOUNT - CURRENTLY LINKED
│ 🌐 WEB - ${settings.botLink}
──────────────────❖

╭─「 *BOT STATUS* ⤵️ 」
│ ⚡ FAST CORE - ACTIVE
│ 🟢 CONNECTION - ONLINE
╰─────────────────❖

${settings.footer}
`;

    try {
      const imagePath = path.resolve(__dirname, "..", settings.aliveImage);
      if (!fs.existsSync(imagePath)) throw new Error("Image file missing: " + imagePath);
      await sock.sendMessage(m.chat, { image: fs.readFileSync(imagePath), caption: text }, { quoted: m });
    } catch (e) {
      console.log("Alive image failed: " + e.message);
      await sock.sendMessage(m.chat, { text }, { quoted: m });
    }
  }
};
