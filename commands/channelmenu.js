module.exports = {
name: "channelmenu",
execute: async (sock, m, args, settings) => {
const channelLink = settings.channelLink;
const text = `
╭───◐
│ 📢 E TECH OFC CHANNEL
╰───◐

╭───◐
│ Official Channel Link:
│ ${channelLink}
│
│ Follow for:
│ • Bot Updates 🚀
│ • New Commands ⚡
│ • Giveaways 🎁
│ • Pairing Codes 🔗
╰───◐

╭─「 Reply Number ⬇️ 」
│ 1️⃣ MAIN MENU
│ 2️⃣ FOLLOW CHANNEL
╰───◐

${settings.footer}
`;
try {
  await sock.sendMessage(m.chat, {
    image: { url: settings.menuImage },
    caption: text,
    contextInfo: {
      externalAdReply: {
        title: "E TECH OFC - Official Channel",
        body: "Tap here to Follow our WhatsApp Channel",
        thumbnailUrl: settings.menuImage,
        sourceUrl: channelLink,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m });
} catch (e) {
  console.log("Channel menu image failed: "+e.message);
  await sock.sendMessage(m.chat, { text }, { quoted: m });
}
}
}