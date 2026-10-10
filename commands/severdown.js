module.exports = {
  name: "serverdown",
  alias: ["serveroff","maintenance"],
  async execute(sock, m, args, settings) {
    const chat = m.chat;
    if (!chat.endsWith("@g.us")) return sock.sendMessage(chat, { text: `❌ Group only\n${settings.footer}` }, { quoted: m });

    try { await sock.sendMessage(chat, { react: { text: "⏳", key: m.key } }); } catch {}

    // ROBUST ADMIN CHECK - Works with new LID system
    let groupMetadata;
    try {
      groupMetadata = await sock.groupMetadata(chat);
    } catch {
      return sock.sendMessage(chat, { text: `❌ Can't fetch group data, try again\n${settings.footer}` }, { quoted: m });
    }

    const normalize = (jid) => {
      if(!jid) return "";
      return String(jid).split("@")[0].split(":")[0].replace(/[^0-9]/g,"").slice(-10); // last 10 digits of phone
    };

    const botJids = [sock.user?.id, sock.user?.lid, sock.user?.jid].filter(Boolean);
    const botNums = botJids.map(normalize).filter(Boolean);

    let botParticipant = groupMetadata.participants.find(p => {
      const pIds = [p.id, p.lid, p.jid].filter(Boolean);
      const pNums = pIds.map(normalize);
      // direct match or phone match
      return pIds.some(id => botJids.includes(id)) || pNums.some(n => botNums.includes(n) && n.length >= 8);
    });

    // FALLBACK: If still not found, check if bot is actually admin by trying to read admin list
    // Sometimes LID hides bot, but if we are admin we can still try
    let botAdmin = botParticipant?.admin === "admin" || botParticipant?.admin === "superadmin";

    // SECOND FALLBACK: If participant not found at all, try to get fresh metadata after 1s
    if (!botParticipant) {
      await new Promise(r => setTimeout(r, 800));
      try {
        const fresh = await sock.groupMetadata(chat);
        botParticipant = fresh.participants.find(p => p.admin);
        // if we found any admin, assume bot is admin (WhatsApp bug) - let the groupSettingUpdate try
        // This prevents false "Bot must be admin"
        if (!botParticipant) {
          // Last resort: try the action directly, if it fails then truly not admin
          botAdmin = true;
        }
      } catch {}
    }

    if (!botAdmin && botParticipant &&!botParticipant.admin) {
       // If we found participant but not admin
       try { await sock.sendMessage(chat, { react: { text: "❌️", key: m.key } }); } catch {}
       return sock.sendMessage(chat, { text: `*❌⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* Bot must be admin\n*┃* Please promote bot to admin\n*┗━「 ${settings.footer} 」*` }, { quoted: m });
    }

    // If botParticipant not found but we set botAdmin=true as fallback, let it try

    global.antiInboxMode = true;
    global.antiInboxGroups = global.antiInboxGroups || [];
    if (!global.antiInboxGroups.includes(chat)) global.antiInboxGroups.push(chat);

    const text = `*🚨⃝⃘̉̉̉━⋆─⋆──❂*
*┃* \`𝗦𝗘𝗥𝗩𝗘𝗥 𝗠𝗔𝗜𝗡𝗧𝗘𝗡𝗔𝗡𝗖𝗘\`
*┗━━━━━━━━━━━━━❂*

*┏━「 𝗦𝗧𝗔𝗧𝗨𝗦 」*
*┃* 🔴 \`SERVERS DOWN\`
*┃* 🔒 \`GROUP CLOSED\`
*┃* ⚠️ \`MAINTENANCE MODE\`
*┗━━━━━━━━━━❥❥❥*

*┏━「 𝗜𝗠𝗣𝗢𝗥𝗧𝗔𝗡𝗧 」*
*┃* ❌ \`Do NOT DM Admins\`
*┃* ❌ \`Do NOT DM Bot\`
*┃* ❌ \`Inbox = KICK/BLOCK\`
*┗━━━━━━━━━━❥❥❥*

*┃* _We will notify when back online._
*┃*
*┗━「 ${settings.footer} 」*`;

    try {
      await sock.sendMessage(chat, { text }, { quoted: m });
      try { await sock.sendMessage(chat, { react: { text: "🚨", key: m.key } }); } catch {}

      setTimeout(async () => {
        try {
          await sock.groupSettingUpdate(chat, 'announcement');
          await sock.sendMessage(chat, { text: `*🔒⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`𝗔𝗡𝗧𝗜-𝗜𝗡𝗕𝗢𝗫 𝗔𝗖𝗧𝗜𝗩𝗔𝗧𝗘𝗗\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* Group closed 🔒\n*┗━「 ${settings.footer} 」*` });
          try { await sock.sendMessage(chat, { react: { text: "✅", key: m.key } }); } catch {}
        } catch(err) {
          try { await sock.sendMessage(chat, { react: { text: "❌️", key: m.key } }); } catch {}
          await sock.sendMessage(chat, { text: `*❌⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* Failed to close group\n*┃* ${err.message}\n*┃* Make sure bot is Admin\n*┗━「 ${settings.footer} 」*` });
        }
      }, 1200);
    } catch (e) {
      try { await sock.sendMessage(chat, { react: { text: "❌️", key: m.key } }); } catch {}
      return sock.sendMessage(chat, { text: `*❌⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* ${e.message}\n*┗━「 ${settings.footer} 」*` }, { quoted: m });
    }
  }
};