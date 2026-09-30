module.exports = {
name: "forward",
execute: async (sock, m, args, settings) => {
const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
if(!quoted) return sock.sendMessage(m.chat, {text:"❌ Reply to any message with.forward <jid / number>"}, {quoted: m});
let jid = args[0];
if(!jid) return sock.sendMessage(m.chat, {text:"❌ Provide JID or number\nEx:.forward 234707xxx"}, {quoted: m});
if(!jid.includes("@")) jid = jid.replace(/[^0-9]/g,'')+"@s.whatsapp.net";
await sock.sendMessage(jid, {forward: {key: m.message.extendedTextMessage.contextInfo.stanzaId, message: quoted}});
await sock.sendMessage(m.chat, {text:`✅ Forwarded to ${jid}\n> ${settings.footer}`}, {quoted: m});
}
}
