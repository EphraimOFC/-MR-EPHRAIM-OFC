module.exports = {
  name: "close",
  async execute(sock, m, args, settings) {
    const chat = m.chat;
    if (!chat.endsWith("@g.us")) return sock.sendMessage(chat, { text: `❌ Group only\n${settings.footer}` }, { quoted: m });
    let choice = args[0]?.toLowerCase();
    if (!choice) {
      await sock.sendMessage(chat, { react: { text: "⏳", key: m.key } });
      let text = `*🔐⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`𝗖𝗟𝗢𝗦𝗘𝗗 (𝗔𝗗𝗠𝗜𝗡 𝗢𝗡𝗟𝗬)?\`\n*┗━━━━━━━━━━━━━❂*\n\n*Reply with a number:*\n\n*┏━「 𝚁𝚎𝙿𝙻𝚈 𝙽𝚄𝙼𝙱𝚎𝚁 ⤵️ 」*\n*┃* 1️⃣ \`CLOSED (admin only) now\`\n*┃* 2️⃣ \`CLOSED now, auto-undo after a time\`\n*┗━━━━━━━━━━❥❥❥*\n\n*<\> ${settings.footer}*`;
      await sock.sendMessage(chat, { text }, { quoted: m });
      global.closeReply = global.closeReply || {}; global.closeReply[chat]=true; setTimeout(()=>delete global.closeReply[chat],120000);
      await sock.sendMessage(chat, { react: { text: "✅", key: m.key } }); return;
    }
    if (choice === "1") { await sock.groupSettingUpdate(chat, 'announcement'); await sock.sendMessage(chat, { react: { text: "✅", key: m.key } }); return sock.sendMessage(chat, { text: `*🔒 CLOSED (admin only can message)*\n\n*<\> ${settings.footer}*` }, { quoted: m }); }
    if (choice === "2") { await sock.sendMessage(chat, { text: `*⏳ Send duration*\nExample: 10m, 1h, 2h\n\n*<\> ${settings.footer}*` }, { quoted: m }); global.closeTimed={}; global.closeTimed[chat]=true; return; }
    if (global.closeTimed && global.closeTimed[chat]) {
      let ms=0; if(choice.endsWith('m')) ms=parseInt(choice)*60000; if(choice.endsWith('h')) ms=parseInt(choice)*3600000; if(!ms) return sock.sendMessage(chat,{text:`❌ Use 10m or 1h`},{quoted:m});
      await sock.groupSettingUpdate(chat,'announcement'); await sock.sendMessage(chat,{text:`*✅ CLOSED for ${choice}*\n\n*<\> ${settings.footer}*`},{quoted:m});
      setTimeout(async()=>{try{await sock.groupSettingUpdate(chat,'not_announcement'); await sock.sendMessage(chat,{text:`*🔓 Auto-opened after ${choice}*`});}catch{}},ms); delete global.closeTimed[chat];
    }
  }
};
