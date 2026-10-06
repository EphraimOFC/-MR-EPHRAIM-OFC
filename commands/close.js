const { jidNormalizedUser } = require('@whiskeysockets/baileys');

module.exports = {
  name: "close",
  execute: async (sock, m, args, settings) => {
    if (!m.chat.endsWith("@g.us")) {
      return sock.sendMessage(m.chat,{text:"❌ This command is for groups only!"},{quoted:m});
    }

    const groupMetadata = await sock.groupMetadata(m.chat);
    const botJid = jidNormalizedUser(sock.user?.id);
    const senderJid = jidNormalizedUser(m.key.participant || m.key.remoteJid);
    const botParticipant = groupMetadata.participants.find(p => jidNormalizedUser(p.id) === botJid);
    const senderParticipant = groupMetadata.participants.find(p => jidNormalizedUser(p.id) === senderJid);
    const isBotAdmin = !!botParticipant?.admin;
    const isSenderAdmin = !!senderParticipant?.admin;
    const protectedNumbers = (settings.protectedNumbers || settings.ownerNumbers || []).map(String);\n    const isOwner = protectedNumbers.some(num => senderJid.includes(num));

    if (!isBotAdmin) {
      return sock.sendMessage(m.chat,{text:"❌ Bot must be an admin to close the group. Promote E TECH OFC first."},{quoted:m});
    }
    if (!isSenderAdmin && !isOwner) {
      return sock.sendMessage(m.chat,{text:"❌ Only a group admin or the bot owner can use this command."},{quoted:m});
    }

    try {
      await sock.groupSettingUpdate(m.chat, 'announcement');
      await sock.sendMessage(m.chat, { text: `🔒 *Group Closed*

Only admins can send messages now.

${settings.footer}` }, { quoted: m });
    } catch(error) {
      await sock.sendMessage(m.chat, { text: `❌ Could not close the group: ${error.message}` }, { quoted: m });
    }
  }
};