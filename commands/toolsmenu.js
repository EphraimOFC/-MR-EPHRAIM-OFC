module.exports = {
name: "toolsmenu",
execute: async (sock, m, args, settings) => {
const text = `╭───◐\n│ 🛠️ TOOLS MENU\n╰───◐\n╭───◐\n│.ping\n│.alive\n│.system\n│.sticker\n│.antiviewonce\n│.hide / .unhide\n│.bot / .send\n╰───◐\n${settings.footer}`;
try { await sock.sendMessage(m.chat, { image: { url: settings.menuImage }, caption: text }, { quoted: m }); } catch (e) { console.log('Menu image failed: '+e.message); await sock.sendMessage(m.chat, { text }, { quoted: m }); }
}
}
