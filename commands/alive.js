const fs=require('fs');
const path=require('path');

module.exports={
  name:'alive',
  execute:async(sock,m,args,settings)=>{
    const text=[
      '╭─〔 ⚡ E TECH OFC 〕─╮',
      '│ 👋 *I\'M ALIVE NOW*',
      '╰────────────────────╯',
      '',
      '👑 Owner: *'+settings.ownerName+'*',
      '🤖 Bot: *E TECH OFC*',
      '🚀 Version: *2.0.0*',
      '⚙️ Prefix: *'+settings.prefix+'*',
      '🟢 Connection: *ONLINE*',
      '⚡ Core: *FAST & ACTIVE*',
      '',
      '📂 *Menu:* .menu',
      '🤖 *Pair:* .pair <number>',
      '🌐 *Website:* '+settings.botLink,
      '',
      settings.footer
    ].join('\n');
    const imagePath=path.resolve(__dirname,'..',settings.aliveImage||'');
    try{
      if(fs.existsSync(imagePath)) await sock.sendMessage(m.chat,{image:fs.readFileSync(imagePath),caption:text},{quoted:m});
      else await sock.sendMessage(m.chat,{text:text},{quoted:m});
    }catch(e){ await sock.sendMessage(m.chat,{text:text},{quoted:m}); }
  }
};