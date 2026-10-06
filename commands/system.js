const os = require('os');
module.exports={name:"system",execute:async(sock,m,a,s)=>{
let txt=`┌─「 *SYSTEM INFO* 」\n│ RAM: ${(process.memoryUsage().heapUsed/1024/1024).toFixed(2)} MB / ${Math.round(os.totalmem()/1024/1024)} MB\n│ CPU: ${os.cpus()[0].model}\n│ Platform: ${os.platform()}\n│ Uptime: ${Math.floor(os.uptime()/60)} mins\n│ Node: ${process.version}\n└────────\n${s.footer}`;
await sock.sendMessage(m.chat,{text:txt},{quoted:m});
}};
