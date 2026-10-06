module.exports={name:"hidetag",execute:async(sock,m,a,s)=>{
if(!m.chat.endsWith("@g.us")) return sock.sendMessage(m.chat,{text:"❌ Group only."},{quoted:m});
const meta=await sock.groupMetadata(m.chat);
const text=a.join(" ")||"📢 Attention everyone";
const mentions=meta.participants.map(p=>p.id);
await sock.sendMessage(m.chat,{text,mentions},{quoted:m});
}};