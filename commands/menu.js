const fs=require('fs');
const path=require('path');
const { sendInteractive, quickReply } = require('../ui');

module.exports={
  name:'menu',
  execute:async(sock,m,args,settings)=>{
    const imagePath=path.resolve(__dirname,'..',settings.menuImage||'');
    const body=[
      '✨ *WELCOME TO E TECH OFC*',
      '',
      '👋 Hello! Welcome back.',
      '',
      '╭───────────────╮',
      '│ 👑 *OWNER*  → '+settings.ownerName,
      '│ 🤖 *BOT*    → E TECH OFC',
      '│ 🚀 *VERSION* → 2.0.0',
      '│ ⚡ *STATUS* → ONLINE',
      '╰───────────────╯',
      '',
      '⚡ *MAIN MENU*',
      '',
      'Choose a section using the buttons below.'
    ].join('\n');

    const image=fs.existsSync(imagePath)?imagePath:null;
    try{
      await sendInteractive(sock,m,{
        title:'E TECH OFC • MAIN MENU',
        body,
        image,
        buttons:[
          quickReply('↩ OWNER MENU 👑','menu_1'),
          quickReply('↩ SOCIAL MENU 🌐','menu_2'),
          quickReply('↩ AI MENU 🤖','menu_3'),
          quickReply('↩ GROUP MENU 👥','menu_4'),
          quickReply('↩ TOOLS MENU 🛠️','menu_5'),
          quickReply('↩ CHANNEL MENU 📢','menu_7')
        ],
        footer:settings.footer
      });
    }catch(e){
      const fallback=body+'\n\n'+settings.footer;
      if(image) await sock.sendMessage(m.chat,{image:fs.readFileSync(image),caption:fallback},{quoted:m});
      else await sock.sendMessage(m.chat,{text:fallback},{quoted:m});
    }
  }
};
