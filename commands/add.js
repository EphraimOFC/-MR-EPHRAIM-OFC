module.exports={name:"add",execute:async(sock,m,a,s)=>{
if(!m.chat.endsWith("@g.us")) return;
let num = a[0]?.replace(/[^0-9]/g,'')+"@s.whatsapp.net";
await sock.groupParticipantsUpdate(m.chat,[num],"add");
sock.sendMessage(m.chat,{text:`✅ Added ${num}\n> ${s.footer}`},{quoted:m});
}};
