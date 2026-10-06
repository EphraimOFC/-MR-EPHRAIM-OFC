module.exports = {
name: "channelmenu",
execute: async (sock, m, args, settings) => {
const channelLink = "https://whatsapp.com/channel/0029VbCrylkDp2Q0MbaKpp16";

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

// Also send a direct follow button message
await sock.sendMessage(m.chat, {
  text: `*Click below to Follow E TECH OFC Channel:*\n${channelLink}`,
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "120363285347309244@newsletter",
      serverMessageId: 1,
      newsletterName: "E TECH OFC"
    }
  }
}, { quoted: m });
}
      }
