module.exports={name:"glink",execute:async(sock,m,a,s)=>{
let code=await sock.groupInviteCode(m.chat);
await sock.sendMessage(m.chat,{text:`🔗 https://chat.whatsapp.com/${code}\n> ${s.footer}`},{quoted:m});
}};
