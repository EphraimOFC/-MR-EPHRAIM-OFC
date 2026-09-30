module.exports={name:"creact",execute:async(sock,m,a,s)=>{
global.creact = !global.creact;
await sock.sendMessage(m.chat,{text:`⚡ *Channel Auto React* is now ${global.creact?"ON ✅":"OFF ❌"}\n\nBot go dey react to new channel posts automatically\n> ${s.footer}`},{quoted:m});
}};
