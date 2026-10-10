module.exports = {
  name: "serverup",
  alias: ["serveron"],
  async execute(sock, m, args, settings) {
    const chat = m.chat;
    if (!chat.endsWith("@g.us")) return sock.sendMessage(chat, { text: `❌ Group only` }, { quoted: m });

    const message = `✅ *SERVERS RESTORED* ✅
━━━━━━━━━━━━━━━━━━━━━

Great news!

All servers are now *BACK ONLINE* and working perfectly.

The group is now *OPENED* for everyone.

Thank you for your patience and understanding.

*👨‍💻 Developed By MR EPHRAIM OFC*
*© Powered by E TECH OFC™*
━━━━━━━━━━━━━━━━━━━━━`;

    try {
      await sock.groupSettingUpdate(chat, 'not_announcement');
      await sock.sendMessage(chat, { text: message });
      await sock.sendMessage(chat, { react: { text: "✅", key: m.key } });
    } catch (e) {
      return sock.sendMessage(chat, { text: `❌ Bot must be admin\n${settings.footer}` }, { quoted: m });
    }
  }
};
