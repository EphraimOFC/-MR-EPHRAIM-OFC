module.exports = {
name: "privacy",
execute: async (sock, m, args, settings) => {
const text = `┌─「 *PRIVACY MENU* 」\n│.privacy public → Everyone can use bot\n│.privacy private → Only owner/sudo\n│.privacy group → Group only\n│.privacy pc → Private chat only\n│\n│ Current: ${global.privacyMode||"public"}\n└─────────────\n> ${settings.footer}`;
if(!args[0]) return sock.sendMessage(m.chat, {text}, {quoted: m});
const mode = args[0].toLowerCase();
if(["public","private","group","pc","inbox"].includes(mode)){
global.privacyMode = mode;
return sock.sendMessage(m.chat, {text: `✅ Privacy set to *${mode}*\n> ${settings.footer}`}, {quoted: m});
}
await sock.sendMessage(m.chat, {text}, {quoted: m});
}
}
