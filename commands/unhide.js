module.exports={name:"unhide",execute:async(sock,m,a,s)=>{
if(!a[0]) return sock.sendMessage(m.chat,{text:"❌ Give hidden code"}, {quoted:m});
try{
let decoded=Buffer.from(a[0], 'base64').toString();
await sock.sendMessage(m.chat,{text:`🔓 Unhidden:\n${decoded}\n> ${s.footer}`},{quoted:m});
}catch{ await sock.sendMessage(m.chat,{text:"❌ Invalid code"}, {quoted:m}); }
}};
