const fs = require('fs');

module.exports = {
  name: "menu",
  execute: async (sock, m, args, settings) => {
    const total = 55;
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
│ 🚀 VERSION - E TECH V2.0
│ 📜 COMMAND MODULES - ${total}
│ ⚙️ PREFIX - [ ${settings.prefix} ]
│ 🤖 ACCOUNT - CONNECTED WHATSAPP
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

    try {
      const imagePath = settings.menuImage;
      if (!fs.existsSync(imagePath)) throw new Error("Image file missing: " + imagePath);
      await sock.sendMessage(m.chat, { image: fs.readFileSync(imagePath), caption: text }, { quoted: m });
    } catch (e) {
      console.log("Menu image failed: " + e.message);
      await sock.sendMessage(m.chat, { text }, { quoted: m });
    }
  }
};
