const path=require('path');
const { sendInteractive, quickReply } = require('../ui');

module.exports={
  name:"alive",
  execute:async(sock,m,args,settings)=>{
    const text=[
      "╭─〔 ⚡ E TECH OFC 〕─╮",
      "│ 👋 *I'M ALIVE NOW*",
      "╰────────────────────╯",
      "",
      `👑 Owner: *${settings.ownerName}*`,
      "🤖 Bot: *E TECH OFC*",
      "🚀 Version: *2.0.0*",
      `⚙️ Prefix: *${settings.prefix}*`,
      "🟢 Connection: *ONLINE*",
      "⚡ Core: *FAST & ACTIVE*",
      `🌐 Web: ${settings.botLink}`,
      "",
      "Select an action below."
    ].join("\n");

    try{
      await sendInteractive(sock,m,{
        title:"E TECH OFC • ONLINE",
        body:text,
        image:path.resolve(__dirname,"..",settings.aliveImage),
        footer:settings.buttonFooter || "⚡ Powered by N TECH PRO",
        buttons:[
          quickReply("📂 MAIN MENU","main_menu"),
          quickReply("🤖 CREATE BOT","create_bot"),
          quickReply("🌐 VISIT SITE","visit_site")
        ]
      });
    }catch(e){
      await sock.sendMessage(m.chat,{text:text+"\n\n"+settings.footer},{quoted:m});
    }
  }
};
