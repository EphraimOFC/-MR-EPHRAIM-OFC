const { sendInteractive, quickReply } = require('../ui');
module.exports = {
  name: "ownermenu",
  execute: async (sock, m, args, settings) => {
    const protectedNumbers = (settings.protectedNumbers || settings.ownerNumbers || []).map(String);
    const sender = m.key.participant || m.key.remoteJid;
    if(!protectedNumbers.some(num => String(sender).includes(num))){
      return sock.sendMessage(m.chat, { text: "❌ *OWNER ONLY*\n\nOnly the protected E TECH OFC owner can use this command." }, { quoted:m });
    }
    const text = [
      "╭─〔 👑 OWNER MENU 〕─╮",
      "│ 🔗 .glink / .glinkreset",
      "│ 👑 .setsudo / .delsudo",
      "│ 🚫 .ban / .unban",
      "│ 📞 .setcall / .delcall",
      "│ 🔐 .privacy",
      "│ ⚙️ .setting",
      "╰────────────────────╯"
    ].join("\n");
    try {
      await sendInteractive(sock,m,{
        title:"E TECH OFC • OWNER",
        body:text,
        image:settings.menuImage,
        footer:settings.buttonFooter || "⚡ Powered by N TECH PRO",
        buttons:[
          quickReply("⚙️ SETTINGS",".setting"),
          quickReply("🔐 PRIVACY",".privacy"),
          quickReply("🏠 MAIN MENU",".menu")
        ]
      });
    } catch(e){ await sock.sendMessage(m.chat,{text:text+"\n\n"+settings.footer},{quoted:m}); }
  }
};
