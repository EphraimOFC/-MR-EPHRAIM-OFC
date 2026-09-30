module.exports = {
name: "groupmenu",
execute: async (sock, m, args, settings) => {
const text = `╭───◐\n│ 👥 GROUP MENU\n╰───◐\n╭───◐\n│.tagall\n│.hidetag\n│.kick\n│.add\n│.promote\n│.demote\n╰───◐\n> ${settings.footer}`;
await sock.sendMessage(m.chat, { image: { url: settings.menuImage }, caption: text }, { quoted: m });
}
}
