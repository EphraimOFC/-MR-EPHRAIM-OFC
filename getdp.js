module.exports = {
name: "getdp",
execute: async (sock, m, args, settings) => {
let jid = m.mentionedJid?.[0] || (m.message?.extendedTextMessage?.contextInfo?.participant) || args[0]?.replace(/[^0-9]/g,'')+"@s.whatsapp.net";
if(!args[0] &&!m.mentionedJid?.[0]) jid = m.key.participant || m.chat;
try{
let url = await sock.profilePictureUrl(jid, 'image');
await sock.sendMessage(m.chat, {image: {url}, caption: `*DP of* ${jid}\n> ${settings.footer}`}, {quoted: m});
}catch{
await sock.sendMessage(m.chat, {text: "❌ No DP or private"}, {quoted: m});
}
}
}
