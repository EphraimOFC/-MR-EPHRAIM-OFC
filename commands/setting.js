module.exports = {
name: "setting",
execute: async (sock, m, args, settings) => {
const cap = `┌─「 *BOT SETTINGS* 」\n│ • Bot Name: ${settings.botName||"E TECH OFC"}\n│ • Owner: ${settings.ownerName}\n│ • Prefix: ${settings.prefix}\n│ • Privacy: ${global.privacyMode||"public"}\n│ • AntiViewOnce: ${global.antiviewonce? "ON":"OFF"}\n│ • AntiCall: ${global.anticall? "ON":"OFF"}\n│\n│ Use:.setpp,.antiviewonce on/off,.setcall on/off\n└─────────────\n> ${settings.footer}`;
await sock.sendMessage(m.chat, {text: cap}, {quoted: m});
}
}
