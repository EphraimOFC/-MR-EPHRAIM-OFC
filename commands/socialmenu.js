module.exports = {
name: "socialmenu",
execute: async (sock, m, args, settings) => {
const text = `╭───◐\n│ 🌐 SOCIAL MENU\n╰───◐\n╭───◐\n│.tiktok\n│.play\n│.ytmp4\n│.insta\n│.fb\n╰───◐\n${settings.footer}`;
await sock.sendMessage(m.chat, { image: { url: settings.menuImage }, caption: text }, { quoted: m });
}
}
