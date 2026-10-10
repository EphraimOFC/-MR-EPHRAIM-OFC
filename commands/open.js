module.exports = {
  name: "open",
  async execute(sock, m, args, settings) {
    const chat = m.chat;
    if (!chat.endsWith("@g.us")) return sock.sendMessage(chat, { text: `❌ Group only\n${settings.footer}` }, { quoted: m });
    let choice = args[0]?.toLowerCase();
    if (!choice) {
      await sock.sendMessage(chat, { react: { text: "⏳", key: m.key } });
      let text = `*🔐⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`𝗢𝗣𝗘𝗡𝗘𝗗 (𝗘𝗩𝗘𝗥𝗬𝗢𝗡𝗘 𝗖𝗔𝗡 𝗠𝗘𝗦𝗦𝗔𝗚𝗘)?\`\n*┗━━━━━━━━━━━━━❂*\n\n*Reply with a number:*\n\n*┏━「 𝚁𝚎𝙿𝙻𝚈 𝙽𝚄𝙼𝙱𝚎𝚁 ⤵️ 」*\n*┃* 1️⃣ \`OPENED (everyone can message) now\`\n*┃* 2️⃣ \`OPENED now, auto-undo after a time\`\n*┗━━━━━━━━━━❥❥❥*\n\n*<\> ${settings.footer}*`;
      await sock.sendMessage(chat, { text }, { quoted: m });
      global.openReply = global.openReply || {}; global.openReply[chat]=true; setTimeout(()=>delete global.openReply[chat],120000);
      await sock.sendMessage(chat, { react: { text: "✅", key: m.key } }); return;
    }
    if (choice === "1") { await sock.groupSettingUpdate(chat, 'not_announcement'); await sock.sendMessage(chat, { react: { text: "✅", key: m.key } }); return sock.sendMessage(chat, { text: `*🔓 OPENED (everyone can message)*\n\n*<\> ${settings.footer}*` }, { quoted: m }); }
    if (choice === "2") { await sock.sendMessage(chat, { text: `*⏳ Send duration*\nExample: 10m, 1h, 2h\n\n*<\> ${settings.footer}*` }, { quoted: m }); global.openTimed={}; global.openTimed[chat]=true; return; }
    if (global.openTimed && global.openTimed[chat]) {
      let ms=0; if(choice.endsWith('m')) ms=parseInt(choice)*60000; if(choice.endsWith('h')) ms=parseInt(choice)*3600000; if(!ms) return sock.sendMessage(chat,{text:`❌ Use 10m or 1h`},{quoted:m});
      await sock.groupSettingUpdate(chat,'not_announcement'); await sock.sendMessage(chat,{text:`*✅ OPENED for ${choice}*\n\n*<\> ${settings.footer}*`},{quoted:m});
      setTimeout(async()=>{try{await sock.groupSettingUpdate(chat,'announcement'); await sock.sendMessage(chat,{text:`*🔒 Auto-closed after ${choice}*`});}catch{}},ms); delete global.openTimed[chat];
    }
  }
};
