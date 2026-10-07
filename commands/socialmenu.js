const { sendInteractive, quickReply } = require('../ui');
module.exports = {
  name: "socialmenu",
  execute: async (sock, m, args, settings) => {
    const text = [
      "╭─〔 🌐 SOCIAL MENU 〕─╮",
      "│ 🎵 .song / .play",
      "│ 🎬 .video",
      "│ 🎵 .tiktok",
      "│ 📸 .insta",
      "│ 📘 .fb",
      "│ 🎞️ .movie / .cinesubz",
      "│ 📦 .apk  •  🖼️ .img",
      "│ 🔗 .url  •  📱 .ss",
      "╰────────────────────╯"
    ].join("\n");
    try {
      await sendInteractive(sock,m,{
        title:"E TECH OFC • SOCIAL",
        body:text,
        image:settings.menuImage,
        footer:settings.buttonFooter || "© Powered by E TECH OFC™",
        buttons:[
          quickReply("🎵 SONG",".song"),
          quickReply("🎬 VIDEO",".video"),
          quickReply("🏠 MAIN MENU",".menu")
        ]
      });
    } catch(e){ await sock.sendMessage(m.chat,{text:text+"\n\n"+settings.footer},{quoted:m}); }
  }
};
