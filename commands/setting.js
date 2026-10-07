const { sendInteractive, quickReply } = require('../ui');

module.exports = {
  name: "setting",
  alias: ["settings", "set"],
  execute: async (sock, m, args, settings) => {
    const isOwner = (settings.protectedNumbers || settings.ownerNumbers || [])
      .map(String)
      .some(num => String(m.key.participant || m.key.remoteJid || "").includes(num));

    if(!isOwner){
      return sock.sendMessage(m.chat, {
        text: "❌ *OWNER ONLY*\n\nOnly the protected E TECH OFC owner can change bot settings."
      }, { quoted: m });
    }

    const text = [
      "╭─〔 ⚙️ BOT SETTINGS 〕─╮",
      "│ 🤖 Bot: " + (settings.botName || "E TECH OFC"),
      "│ 👑 Owner: " + settings.ownerName,
      "│ ⌨️ Prefix: " + settings.prefix,
      "│ 🔐 Privacy: " + (global.privacyMode || "public").toUpperCase(),
      "│ 👁️ Anti-ViewOnce: " + (global.antiviewonce ? "ON" : "OFF"),
      "│ 📞 Anti-Call: " + (global.anticall ? "ON" : "OFF"),
      "│ ⚡ Auto React: " + (global.creact ? "ON" : "OFF"),
      "╰────────────────────╯",
      "",
      "Tap an action below to change the live setting."
    ].join("\n");

    try {
      await sendInteractive(sock, m, {
        title: "E TECH OFC • SETTINGS",
        body: text,
        image: settings.menuImage,
        footer: settings.buttonFooter || "⚡ Powered by N TECH PRO",
        buttons: [
          quickReply("👁️ VIEWONCE", ".antiviewonce " + (global.antiviewonce ? "off" : "on")),
          quickReply("📞 CALL " + (global.anticall ? "OFF" : "ON"), ".setcall " + (global.anticall ? "off" : "on")),
          quickReply("⚡ REACT " + (global.creact ? "OFF" : "ON"), ".creact " + (global.creact ? "off" : "on"))
        ]
      });
    } catch(e) {
      await sock.sendMessage(m.chat, { text: text + "\n\n" + settings.footer }, { quoted:m });
    }
  }
};
