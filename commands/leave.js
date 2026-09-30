module.exports={name:"leave",execute:async(sock,m,a,s)=>{
await sock.groupLeave(m.chat);
}};
