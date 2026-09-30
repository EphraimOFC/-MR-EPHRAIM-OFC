module.exports = {
name: "send",
execute: async (sock, m, args, settings) => {
const q = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
const participant = m.message?.extendedTextMessage?.contextInfo?.participant;

// Must be reply to status
if(!m.chat.includes("status@broadcast") && !q){
return sock.sendMessage(m.chat, {text: `❌ *How to use:*\n\n1. View person's status\n2. Reply to that status with *.send*\n\nBot will send you the status\n> ${settings.footer}`}, {quoted: m});
}

try{
let quotedMsg = q || m.message;
let type = Object.keys(quotedMsg)[0]; // imageMessage, videoMessage etc

let buffer = await sock.downloadMediaMessage({message: quotedMsg});

if(type.includes("image")){
await sock.sendMessage(m.chat, {image: buffer, caption: `✅ *Status Saved*\n> ${settings.footer}`}, {quoted: m});
} else if(type.includes("video")){
await sock.sendMessage(m.chat, {video: buffer, caption: `✅ *Status Saved*\n> ${settings.footer}`}, {quoted: m});
} else if(type.includes("audio") || type.includes("voice")){
await sock.sendMessage(m.chat, {audio: buffer, mimetype:"audio/mpeg", ptt: false}, {quoted: m});
} else {
await sock.sendMessage(m.chat, {text: `✅ Status text: ${quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || "Saved"}\n> ${settings.footer}`}, {quoted: m});
}

// Also forward to your DM if you want
let ownerJid = settings.ownerNumber+"@s.whatsapp.net";
if(m.chat !== ownerJid && q){
await sock.sendMessage(ownerJid, {text: `📥 *New Status Saved* from ${participant||m.chat}`});
if(type.includes("image")) await sock.sendMessage(ownerJid, {image: buffer});
if(type.includes("video")) await sock.sendMessage(ownerJid, {video: buffer});
}

}catch(e){
await sock.sendMessage(m.chat, {text: `❌ Failed to get status\nMake sure you REPLY to the status\nError: ${e.message}\n> ${settings.footer}`}, {quoted: m});
}
}
}
