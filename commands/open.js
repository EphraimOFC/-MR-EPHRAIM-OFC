module.exports = {
  name: "open",
  execute: async (sock, m, args, settings) => {
    if (!m.chat.endsWith("@g.us")) return sock.sendMessage(m.chat,{text:"❌ This command is for groups only!"},{quoted:m});

    const groupMetadata = await sock.groupMetadata(m.chat);
    const participants = groupMetadata.participants;
    const isBotAdmin = participants.find(p => p.id === sock.user.id.split(":")[0]+"@s.whatsapp.net")?.admin;
    const sender = m.key.participant || m.chat;
    const isSenderAdmin = participants.find(p => p.id === sender)?.admin;
    const isOwner = sender === "2347072956206@s.whatsapp.net";

    if (!isBotAdmin) return sock.sendMessage(m.chat,{text:"❌ Bot must be admin!"},{quoted:m});
    if (!isSenderAdmin && !isOwner) return sock.sendMessage(m.chat,{text:"❌ Only group admin can use this!"},{quoted:m});

    await sock.groupSettingUpdate(m.chat, 'not_announced');
    await sock.sendMessage(m.chat, { text: `✅ *Group Opened*\n\nEveryone can now send messages.\n\n> ${settings.footer}` }, { quoted: m });
  }
};
