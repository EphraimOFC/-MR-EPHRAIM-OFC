module.exports = {
  name: "close",
  async execute(sock, m, args, settings) {
    const chat = m.chat;
    if (!chat.endsWith("@g.us")) return sock.sendMessage(chat, { text: `❌ Group only\n${settings.footer}` }, { quoted: m });

    let choice = args[0];

    if (!choice) {
      await sock.sendMessage(chat, { react: { text: "⏳", key: m.key } });
      let text = `*🔐⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`𝗖𝗟𝗢𝗦𝗘𝗗 (𝗔𝗗𝗠𝗜𝗡 𝗢𝗡𝗟𝗬)?\`\n*┗━━━━━━━━━━━━━❂*\n\n*Reply with a number:*\n\n*┏━「 𝚁𝚎𝙿𝙻𝚈 𝙽𝚄𝙼𝙱𝚎𝚁 ⤵️ 」*\n*┃* 1️⃣ \`CLOSED now (stays until changed)\`\n*┃* 2️⃣ \`CLOSED now, auto-undo after a time\`\n*┗━━━━━━━━━━❥❥❥*\n\n*<\> ${settings.footer}*`;
      await sock.sendMessage(chat, { text: text }, { quoted: m });
      global.closeReply = global.closeReply || {};
      global.closeReply[chat] = true;
      setTimeout(() => delete global.closeReply[chat], 120000);
      await sock.sendMessage(chat, { react: { text: "✅", key: m.key } });
      return;
    }

    if (choice === "1") {
      await sock.groupSettingUpdate(chat, 'announcement');
      await sock.sendMessage(chat, { react: { text: "✅", key: m.key } });
      return sock.sendMessage(chat, { text: `*🔒 CLOSED (admin only can message)*\n\n*<\> ${settings.footer}*` }, { quoted: m });
    }

    if (choice === "2") {
      await sock.sendMessage(chat, { text: `*⏳⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`𝗦𝗘𝗡𝗗 𝗗𝗨𝗥𝗔𝗧𝗜𝗢𝗡\`\n*┗━━━━━━━━━━━━━❂*\n\nExample: *10m, 1h, 2h*\n\n*<\> ${settings.footer}*` }, { quoted: m });
      global.closeTimed = global.closeTimed || {};
      global.closeTimed[chat] = true;
      return;
    }

    if (global.closeTimed && global.closeTimed[chat]) {
      let time = args[0].toLowerCase();
      let ms = 0;
      if (time.endsWith('m')) ms = parseInt(time) * 60 * 1000;
      if (time.endsWith('h')) ms = parseInt(time) * 60 * 60 * 1000;
      if (!ms) return sock.sendMessage(chat, { text: `❌ Invalid time. Use 10m or 1h\n${settings.footer}` }, { quoted: m });

      await sock.groupSettingUpdate(chat, 'announcement');
      await sock.sendMessage(chat, { text: `*✅ CLOSED for ${time}*\n\nWill open automatically after ${time}\n\n*<\> ${settings.footer}*` }, { quoted: m });

      setTimeout(async () => {
        try { await sock.groupSettingUpdate(chat, 'not_announcement'); await sock.sendMessage(chat, { text: `*🔓 Auto-opened after ${time}*\n\n*<\> ${settings.footer}*` }); } catch {}
      }, ms);
      delete global.closeTimed[chat];
      return;
    }
  }
};
