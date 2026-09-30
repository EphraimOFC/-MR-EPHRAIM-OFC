module.exports={name:"hide",execute:async(sock,m,a,s)=>{
let txt=a.join(" ");
if(!txt) return sock.sendMessage(m.chat,{text:"❌ Text to hide?"},{quoted:m});
let hidden=Buffer.from(txt).toString('base64');
await sock.sendMessage(m.chat,{text:`🔒 Hidden:\n${hidden}\nUse .unhide ${hidden}\n> ${s.footer}`},{quoted:m});
}};
