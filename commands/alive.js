const fs=require('fs');
const path=require('path');
const { sendInteractive, quickReply } = require('../ui');

module.exports={
  name:'alive',
  execute:async(sock,m,args,settings)=>{
    const imagePath=path.resolve(__dirname,'..',settings.aliveImage||'');
    const body=[
      '✨ *WELCOME TO E TECH OFC*',
      '',
      '👋 Hello! I\'m alive and ready.',
      '',
      '╭───────────────╮',
      '│ 👑 *OWNER*  → '+settings.ownerName,
      '│ 🤖 *BOT*    → E TECH OFC',
      '│ 🚀 *VERSION* → 2.0.0',
      '│ ⚡ *STATUS* → ONLINE',
      '╰───────────────╯',
      '',
      '⚡ *I\'M ALIVE NOW*',
      '⏱️ Prefix → *'+settings.prefix+'*',
      '',
      '╭─〔 SELECT AN OPTION 〕─╮',
      '│ Use the buttons below',
      '╰───────────────────────╯'
    ].join('\n');

    const image=fs.existsSync(imagePath)?imagePath:null;
    try{
      await sendInteractive(sock,m,{
        title:'E TECH OFC',
        body,
        image,
        buttons:[
          quickReply('↩ MAIN MENU 📜','main_menu'),
          quickReply('↩ CREATE BOT 🤖','create_bot'),
          quickReply('↩ VISIT SITE 🌐','visit_site')
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
