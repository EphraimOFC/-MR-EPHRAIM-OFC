module.exports={name:"tagall",execute:async(sock,m,a,s)=>{
if(!m.chat.endsWith("@g.us")) return sock.sendMessage(m.chat,{text:"❌ Group only."},{quoted:m});
const meta=await sock.groupMetadata(m.chat);
const text=a.join(" ")||"📢 Everyone";
const mentions=meta.participants.map(p=>p.id);
const body=text+"\n\n"+mentions.map(j=>"@"+j.split("@")[0]).join(" ");
await sock.sendMessage(m.chat,{text:body,mentions},{quoted:m});
}};