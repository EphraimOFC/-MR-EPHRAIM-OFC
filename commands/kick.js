module.exports={name:"kick",execute:async(sock,m,a,s)=>{
if(!m.chat.endsWith("@g.us")) return;
let jid = m.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;
await sock.groupParticipantsUpdate(m.chat,[jid],"remove");
sock.sendMessage(m.chat,{text:`✅ Kicked\n> ${s.footer}`},{quoted:m});
}};
