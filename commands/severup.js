module.exports = {
  name: "serverup",
  alias: ["serveron"],
  async execute(sock, m, args, settings) {
    const chat = m.chat;
    global.antiInboxMode = false;
    global.antiInboxGroups = [];

    const text = `*✅⃝⃘̉̉̉━⋆─⋆──❂*
*┃* \`𝗦𝗘𝗥𝗩𝗘𝗥𝗦 𝗥𝗘𝗦𝗧𝗢𝗥𝗘𝗗\`
*┗━━━━━━━━━━━━━❂*

*┏━「 𝗦𝗧𝗔𝗧𝗨𝗦 」*
*┃* 🟢 \`ALL SYSTEMS ONLINE\`
*┃* 🔓 \`GROUP OPENED\`
*┃* ✅ \`ANTI-INBOX OFF\`
*┗━━━━━━━━━━❥❥❥*

*┃* _Thanks for patience._
*┃*
*┗━「 ${settings.footer} 」*`;

    try {
      await sock.groupSettingUpdate(chat, 'not_announcement');
      await sock.sendMessage(chat, { text }, { quoted: m });
      await sock.sendMessage(chat, { react: { text: "✅", key: m.key } });
    } catch {
      return sock.sendMessage(chat, { text: `❌ Bot must be admin\n${settings.footer}` }, { quoted: m });
    }
  }
};
