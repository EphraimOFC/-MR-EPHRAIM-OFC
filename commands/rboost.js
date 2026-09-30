module.exports = {
name: "rboost",
execute: async (sock, m, args, settings) => {
// OWNER ONLY CHECK - Main + Backup
const ownerNumbers = ["2347072956206", "2348108717744"];
const sender = m.key.participant || m.chat || m.sender || "";

// Check if sender contains any of your owner numbers
const isOwner = ownerNumbers.some(num => sender.includes(num)) || ownerNumbers.includes(settings.ownerNumber);

if(!isOwner) return; // silent for normal users - they see nothing

if(!args[0]) {
 return sock.sendMessage(m.chat, {text:`❤️ *RBOOST (Owner Only)*

Reply to a CHANNEL POST with:
.rboost ❤️
.rboost 🔥
.rboost 😂
.rboost 😮
.rboost 🙏

You must use this INSIDE your channel chat.`}, {quoted:m});
}

let emoji = args[0];
let ctx = m.message?.extendedTextMessage?.contextInfo;

if(!ctx ||!ctx.quotedMessage){
 return sock.sendMessage(m.chat, {text:`❌ Reply to a channel message first, then do.rboost ${emoji}`}, {quoted:m});
}

try{
 // This works only when you run the command inside a channel
 let messageId = ctx.stanzaId;
 await sock.newsletterReactMessage(m.chat, messageId, emoji);
 await sock.sendMessage(m.chat, {text:`✅ Reacted ${emoji} successfully\n> ${settings.footer}`}, {quoted:m});
}catch(e){
 await sock.sendMessage(m.chat, {text:`❌ Failed: ${e.message}\n\nMake sure you are INSIDE the channel when you use it.`}, {quoted:m});
}
}
}
