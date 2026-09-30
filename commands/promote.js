module.exports={name:"promote",execute:async(sock,m,a,s)=>{
let jid=m.mentionedJid?.[0]; await sock.groupParticipantsUpdate(m.chat,[jid],"promote");
sock.sendMessage(m.chat,{text:`👑 Promoted\n> ${s.footer}`},{quoted:m});
}};
