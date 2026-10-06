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
│ 🚀 VERSION - 2.0.0
│ 📜 COMMANDS - 55
│ ⚙️ PREFIX - [ ${settings.prefix} ]
│ 🤖 ACTIVE - 24/7 ONLINE
│ 🌐 WEB - ${settings.botLink}
──────────────────❖

╭─「 *BOT STATUS* ⤵️ 」
│ ⚡ FAST CORE - ACTIVE
│ 🟢 CONNECTION - ONLINE
╰─────────────────❖

${settings.footer}
`;

    try {
      const response = await axios.get(settings.aliveImage, {
        responseType: "arraybuffer",
        timeout: 15000
      });
      await sock.sendMessage(
        m.chat,
        { image: Buffer.from(response.data), caption: text },
        { quoted: m }
      );
    } catch (e) {
      console.log("Alive image failed: " + e.message);
      await sock.sendMessage(m.chat, { text }, { quoted: m });
    }
  }
};
