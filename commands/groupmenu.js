const { sendInteractive, quickReply } = require('../ui');
module.exports = {
  name: "groupmenu",
  execute: async (sock, m, args, settings) => {
    const text = [
      "╭─〔 👥 GROUP MENU 〕─╮",
      "│ ➕ .add 234xxx",
      "│ 👢 .kick @user",
      "│ 👑 .promote @user",
      "│ 🔻 .demote @user",
      "│ 📢 .tagall / .hidetag",
      "│ 🔒 .close  •  🔓 .open",
      "│ 🚪 .leave",
      "╰────────────────────╯",
      "",
      "🛡️ Protected owner numbers remain protected."
    ].join("\n");
    try {
      await sendInteractive(sock,m,{
        title:"E TECH OFC • GROUP",
        body:text,
        image:settings.menuImage,
        footer:settings.buttonFooter || "⚡ Powered by N TECH PRO",
        buttons:[
          quickReply("🔓 OPEN",".open"),
          quickReply("🔒 CLOSE",".close"),
          quickReply("🏠 MAIN MENU",".menu")
        ]
      });
    } catch(e){ await sock.sendMessage(m.chat,{text:text+"\n\n"+settings.footer},{quoted:m}); }
  }
};
