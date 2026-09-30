module.exports={name:"resetlink",execute:async(sock,m,a,s)=>{
await sock.groupRevokeInvite(m.chat);
let code=await sock.groupInviteCode(m.chat);
await sock.sendMessage(m.chat,{text:`🔗 New link: https://chat.whatsapp.com/${code}\n> ${s.footer}`},{quoted:m});
}};
