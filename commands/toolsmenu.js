const { sendInteractive, quickReply } = require('../ui');
module.exports = {
  name: "toolsmenu",
  execute: async (sock, m, args, settings) => {
    const text = [
      "╭─〔 🛠️ TOOLS MENU 〕─╮",
      "│ 🏓 .ping",
      "│ 💚 .alive",
      "│ 📊 .system",
      "│ 🧩 .sticker",
      "│ 👁️ .antiviewonce",
      "│ 🔒 .hide / .unhide",
      "│ 🤖 .bot / .pair",
      "╰────────────────────╯"
    ].join("\n");
    try {
      await sendInteractive(sock,m,{
        title:"E TECH OFC • TOOLS",
        body:text,
        image:settings.menuImage,
        footer:settings.buttonFooter || "⚡ Powered by N TECH PRO",
        buttons:[
          quickReply("🏓 PING",".ping"),
          quickReply("💚 ALIVE",".alive"),
          quickReply("🏠 MAIN MENU",".menu")
        ]
      });
    } catch(e){ await sock.sendMessage(m.chat,{text:text+"\n\n"+settings.footer},{quoted:m}); }
  }
};
