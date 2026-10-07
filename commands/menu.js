const fs = require('fs');
const path = require('path');
const { sendInteractive, quickReply } = require('../ui');

module.exports = {
  name: "menu",
  execute: async (sock, m, args, settings) => {
    const text = [
      "╭─〔 ⚡ E TECH OFC 〕─╮",
      "│ 👋 *Welcome back!*",
      "│ 🤖 Fast • Stable • Professional",
      "╰────────────────────╯",
      "",
      "Choose a menu below. You can also use the command directly.",
      "",
      "👑 Owner  •  🌐 Social  •  👥 Group",
      "🛠️ Tools  •  🤖 AI  •  📢 Channel",
      "",
      "⚡ *Reply buttons are active*"
    ].join("\n");

    try {
      await sendInteractive(sock, m, {
        title: "E TECH OFC • MAIN MENU",
        body: text,
        image: path.resolve(__dirname, "..", settings.menuImage),
        footer: settings.buttonFooter || "⚡ Powered by N TECH PRO",
        buttons: [
          quickReply("📂 MAIN MENU", "main_menu"),
          quickReply("🤖 CREATE BOT", "create_bot"),
          quickReply("🌐 VISIT SITE", "visit_site")
        ]
      });
    } catch (e) {
      console.log("Menu UI failed: " + e.message);
      const imagePath = path.resolve(__dirname, "..", settings.menuImage);
      const fallback = text + "\n\n" + settings.footer;
      if (fs.existsSync(imagePath)) await sock.sendMessage(m.chat, { image: fs.readFileSync(imagePath), caption: fallback }, { quoted: m });
      else await sock.sendMessage(m.chat, { text: fallback }, { quoted: m });
    }
  }
};
