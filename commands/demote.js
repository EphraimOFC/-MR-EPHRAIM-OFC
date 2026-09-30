module.exports={name:"demote",execute:async(sock,m,a,s)=>{
let jid=m.mentionedJid?.[0]; await sock.groupParticipantsUpdate(m.chat,[jid],"demote");
sock.sendMessage(m.chat,{text:`Removed admin\n> ${s.footer}`},{quoted:m});
}};
