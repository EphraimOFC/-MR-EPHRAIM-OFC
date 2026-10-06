module.exports = {
name: "aimenu",
execute: async (sock, m, args, settings) => {
const text = `╭───◐\n│ 🤖 AI MENU\n╰───◐\n╭───◐\n│.ai\n│.gpt\n│.imagine\n│.gemini\n╰───◐\n${settings.footer}`;
try { await sock.sendMessage(m.chat, { image: { url: settings.menuImage }, caption: text }, { quoted: m }); } catch (e) { console.log('Menu image failed: '+e.message); await sock.sendMessage(m.chat, { text }, { quoted: m }); }
}
}
