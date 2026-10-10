module.exports = {
  name: "serverdown",
  alias: ["serveroff","maintenance"],
  async execute(sock, m, args, settings) {
    const chat = m.chat;
    if (!chat.endsWith("@g.us")) return sock.sendMessage(chat, { text: `❌ Group only\n${settings.footer}` }, { quoted: m });

    const groupMetadata = await sock.groupMetadata(chat);
    // Match the bot against WhatsApp's possible device/LID participant IDs.
    const normalizeJid = (jid) => String(jid || "").replace(/:\\d+(?=@)/, "");
    const botIds = [sock.user?.id, sock.user?.lid].filter(Boolean).map(normalizeJid);
    const botPhone = String(sock.user?.id || "").split("@")[0].split(":")[0];
    const botParticipant = groupMetadata.participants.find((p) => {
      const participantIds = [p.id, p.lid].filter(Boolean).map(normalizeJid);
      return participantIds.some((id) => botIds.includes(id)) ||
        participantIds.some((id) => id.split("@")[0].split(":")[0] === botPhone);
    });
    const botAdmin = botParticipant?.admin === "admin" || botParticipant?.admin === "superadmin";
    if (!botAdmin) return sock.sendMessage(chat, { text: `❌ Bot must be admin\n${settings.footer}` }, { quoted: m });

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
      await sock.sendMessage(chat, { react: { text: "🚨", key: m.key } });
      await sock.sendMessage(chat, { text }, { quoted: m });
      setTimeout(async () => {
        try {
          await sock.groupSettingUpdate(chat, 'announcement');
          await sock.sendMessage(chat, { text: `*🔒⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`𝗔𝗡𝗧𝗜-𝗜𝗡𝗕𝗢𝗫 𝗔𝗖𝗧𝗜𝗩𝗔𝗧𝗘𝗗\`\n*┗━━━━━━━━━━━━━❂*\n\n*<\> ${settings.footer}*` });
        } catch {}
      }, 1200);
    } catch (e) {
      return sock.sendMessage(chat, { text: `❌ ${e.message}` }, { quoted: m });
    }
  }
};
