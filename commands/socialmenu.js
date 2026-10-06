module.exports = {
name: "socialmenu",
execute: async (sock, m, args, settings) => {
const text = `╭───◐\n│ 🌐 SOCIAL MENU\n╰───◐\n╭───◐\n│.song / .play\n│.video\n│.tiktok\n│.insta\n│.fb\n│.movie\n│.apk\n│.img\n│.url\n│.cinesubz\n│.ss\n╰───◐\n${settings.footer}`;
try { await sock.sendMessage(m.chat, { image: { url: settings.menuImage }, caption: text }, { quoted: m }); } catch (e) { console.log('Menu image failed: '+e.message); await sock.sendMessage(m.chat, { text }, { quoted: m }); }
}
}
