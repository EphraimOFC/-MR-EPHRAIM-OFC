const fs = require('fs');

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
      const response = await axios.get(settings.aliveImage, {
        responseType: "arraybuffer",
        timeout: 12000
      });
      await sock.sendMessage(m.chat, { image: Buffer.from(response.data), caption: text }, { quoted: m });
    } catch (e) {
      console.log("Alive image failed: " + e.message);
      const fallback = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1048" height="592" viewBox="0 0 1048 592"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#160b24"/><stop offset="1" stop-color="#e889bd"/></linearGradient></defs><rect width="1048" height="592" fill="url(#g)"/><text x="524" y="270" text-anchor="middle" fill="white" font-size="72" font-family="Arial" font-weight="700">E TECH OFC</text><text x="524" y="335" text-anchor="middle" fill="white" font-size="30" font-family="Arial">MR EPHRAIM OFC • ONLINE</text></svg>`);
      await sock.sendMessage(m.chat, { image: fallback, caption: text }, { quoted: m });
    }
  }
};
