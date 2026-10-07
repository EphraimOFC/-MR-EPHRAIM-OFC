const fs=require('fs');
const path=require('path');

module.exports={
  name:'menu',
  execute:async(sock,m,args,settings)=>{
    const text=[
      '╭─〔 ⚡ E TECH OFC • MAIN MENU 〕─╮',
      '│ 👋 *Welcome back!*',
      '│ 🤖 Fast • Stable • Professional',
      '╰──────────────────────────────╯',
      '',
      '👑 *OWNER*  •  .ownermenu',
      '🌐 *SOCIAL* •  .socialmenu',
      '👥 *GROUP*  •  .groupmenu',
      '🛠️ *TOOLS*  •  .toolsmenu',
      '📢 *CHANNEL* • .channelmenu',
      '',
      '⚡ *Quick commands*',
      '• .alive  • .ping  • .song',
      '• .video  • .movie • .bot',
      '• .setting • .privacy • .pair',
      '',
      settings.footer
    ].join('\n');
    const imagePath=path.resolve(__dirname,'..',settings.menuImage||'');
    try{
      if(fs.existsSync(imagePath)) await sock.sendMessage(m.chat,{image:fs.readFileSync(imagePath),caption:text},{quoted:m});
      else await sock.sendMessage(m.chat,{text:text},{quoted:m});
    }catch(e){ await sock.sendMessage(m.chat,{text:text},{quoted:m}); }
  }
};