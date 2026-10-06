module.exports = {
name: "toolsmenu",
execute: async (sock, m, args, settings) => {
const text = `╭───◐\n│ 🛠️ TOOLS MENU\n╰───◐\n╭───◐\n│.sticker\n│.toimg\n│.url\n│.calc\n│.owner\n╰───◐\n${settings.footer}`;
await sock.sendMessage(m.chat, { image: { url: settings.menuImage }, caption: text }, { quoted: m });
}
}
