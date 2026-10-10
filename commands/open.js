module.exports = {
  name: "open",
  async execute(sock, m, args, settings) {
    const chat = m.chat;
    if (!chat.endsWith("@g.us")) return sock.sendMessage(chat, { text: `❌ Group only\n${settings.footer}` }, { quoted: m });

    // If user replied 1 or 2 directly:?open 1
    let choice = args[0];

    if (!choice) {
      // FIRST MENU
      await sock.sendMessage(chat, { react: { text: "⏳", key: m.key } });
      let text = `*🔐⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`𝗢𝗣𝗘𝗡𝗘𝗗 (𝗘𝗩𝗘𝗥𝗬𝗢𝗡𝗘 𝗖𝗔𝗡 𝗠𝗘𝗦𝗦𝗔𝗚𝗘)?\`\n*┗━━━━━━━━━━━━━❂*\n\n*Reply with a number:*\n\n*┏━「 𝚁𝚎𝙿𝙻𝚈 𝙽𝚄𝙼𝙱𝚎𝚁 ⤵️ 」*\n*┃* 1️⃣ \`OPENED now (stays until changed)\`\n*┃* 2️⃣ \`OPENED now, auto-undo after a time\`\n*┗━━━━━━━━━━❥❥❥*\n\n*<\> ${settings.footer}*`;

      await sock.sendMessage(chat, { text: text }, { quoted: m });
      global.openReply = global.openReply || {};
      global.openReply[chat] = true;
      setTimeout(() => delete global.openReply[chat], 120000);
      await sock.sendMessage(chat, { react: { text: "✅", key: m.key } });
      return;
    }

    if (choice === "1") {
      await sock.groupSettingUpdate(chat, 'not_announcement');
      await sock.sendMessage(chat, { react: { text: "✅", key: m.key } });
      return sock.sendMessage(chat, { text: `*⏳⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`𝗙𝗢𝗥 𝗛𝗢𝗪 𝗟𝗢𝗡𝗚?\`\n*┗━━━━━━━━━━━━━❂*\n\n*OPENED (everyone can message)*\n\n*<\> ${settings.footer}*` }, { quoted: m });
    }

    if (choice === "2") {
      await sock.sendMessage(chat, { text: `*⏳⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`𝗦𝗘𝗡𝗗 𝗗𝗨𝗥𝗔𝗧𝗜𝗢𝗡\`\n*┗━━━━━━━━━━━━━❂*\n\nExample: *10m, 1h, 2h*\n\n*<\> ${settings.footer}*` }, { quoted: m });
      global.openTimed = global.openTimed || {};
      global.openTimed[chat] = true;
      return;
    }

    // If timed duration like 10m 1h
    if (global.openTimed && global.openTimed[chat]) {
      let time = args[0].toLowerCase();
      let ms = 0;
      if (time.endsWith('m')) ms = parseInt(time) * 60 * 1000;
      if (time.endsWith('h')) ms = parseInt(time) * 60 * 60 * 1000;

      if (!ms) return sock.sendMessage(chat, { text: `❌ Invalid time. Use 10m or 1h\n${settings.footer}` }, { quoted: m });

      await sock.groupSettingUpdate(chat, 'not_announcement');
      await sock.sendMessage(chat, { text: `*✅ OPENED for ${time}*\n\nWill close automatically after ${time}\n\n*<\> ${settings.footer}*` }, { quoted: m });

      setTimeout(async () => {
        try { await sock.groupSettingUpdate(chat, 'announcement'); await sock.sendMessage(chat, { text: `*🔒 Auto-closed after ${time}*\n\n*<\> ${settings.footer}*` }); } catch {}
      }, ms);

      delete global.openTimed[chat];
      return;
    }
  }
};
