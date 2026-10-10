module.exports = {
  name: "serverdown",
  alias: ["serveroff","maintenance"],
  async execute(sock, m, args, settings) {
    const chat = m.chat;
    if (!chat.endsWith("@g.us")) return sock.sendMessage(chat, { text: `❌ Group only\n${settings.footer}` }, { quoted: m });

    // Check if bot is admin
    const groupMetadata = await sock.groupMetadata(chat);
    const botId = sock.user.id.split(":")[0] + "@s.whatsapp.net";
    const botAdmin = groupMetadata.participants.find(p => p.id === botId)?.admin;
    if (!botAdmin) return sock.sendMessage(chat, { text: `❌ Bot must be admin to close group\n${settings.footer}` }, { quoted: m });

    const message = `🚨 *SERVER MAINTENANCE NOTICE* 🚨
━━━━━━━━━━━━━━━━━━━━━

Dear Members,

All our servers are currently *DOWN* due to technical maintenance and upgrade.

Due to this, the group will be *CLOSED* until all systems are fully restored.

⚠️ *IMPORTANT:*
❌ No messages will be sent in inbox
❌ Do NOT DM Admins requesting
❌ Anyone who DMs admin inbox will be *KICKED / BLOCKED*

Please be patient. We will notify you immediately once everything is back online.

We apologize for the inconvenience.

*👨‍💻 Developed By MR EPHRAIM OFC*
*© Powered by E TECH OFC™*
━━━━━━━━━━━━━━━━━━━━━`;

    try {
      await sock.sendMessage(chat, { react: { text: "🚨", key: m.key } });
      
      // Send notice
      await sock.sendMessage(chat, { text: message }, { quoted: m });
      
      // Wait 2 sec then close group (admin only)
      setTimeout(async () => {
        try {
          await sock.groupSettingUpdate(chat, 'announcement');
          await sock.sendMessage(chat, { text: `*🔒 GROUP CLOSED (Admin only)*\n\nMaintenance in progress...\n\n*<\> ${settings.footer}*` });
        } catch (e) {
          console.log("Close failed:", e.message);
        }
      }, 2000);

    } catch (e) {
      return sock.sendMessage(chat, { text: `❌ Error: ${e.message}\n${settings.footer}` }, { quoted: m });
    }
  }
};
