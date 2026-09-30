module.exports = {
name: "ownermenu",
execute: async (sock, m, args, settings) => {
const text = `╭───◐\n│ 👑 OWNER MENU - E TECH OFC\n╰───◐\n╭───◐\n│.restart\n│.broadcast\n│.block\n│.unblock\n│.setpp\n│.clearsession\n╰───◐\n> ${settings.footer}`;
await sock.sendMessage(m.chat, { image: { url: settings.menuImage }, caption: text }, { quoted: m });
}
}
