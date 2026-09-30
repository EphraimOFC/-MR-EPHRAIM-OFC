module.exports = {
name: "edumenu",
execute: async (sock, m, args, settings) => {
const text = `╭───◐\n│ 📚 EDUCATION MENU\n╰───◐\n╭───◐\n│.define\n│.translate\n│.wikipedia\n╰───◐\n> ${settings.footer}`;
await sock.sendMessage(m.chat, { image: { url: settings.menuImage }, caption: text }, { quoted: m });
}
}
