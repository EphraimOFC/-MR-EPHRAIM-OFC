module.exports = {
name: "bot",
execute: async (sock, m, args, settings) => {
const pairCode = Math.random().toString(36).substring(2, 8).toUpperCase() + "-" + Math.floor(1000 + Math.random() * 9000);
const pairingSite = "https://etechofc.vercel.app/pair"; // <-- Change to your actual pair site when you host it
const channelLink = "https://whatsapp.com/channel/0029VbCrylkDp2Q0MbaKpp16";

const text = `
╭───◐
│ 🤖 E TECH OFC - CREATE YOUR BOT
╰───◐
╭───◐
│ Your Pair Request ID: *${pairCode}*
│
│ To get your real WhatsApp Pair Code:
│
│ 1️⃣ Go to: ${pairingSite}
│ 2️⃣ Enter your WhatsApp number
│ 3️⃣ Enter this ID: ${pairCode}
│ 4️⃣ You will get 8-digit Pair Code
│ 5️⃣ Link device on WhatsApp > Linked Devices > Link with phone number
│
│ Your bot will auto-follow:
│ ${channelLink}
╰───◐
╭─「 Reply Number ⬇️ 」
│ 1️⃣ MAIN MENU
│ 2️⃣ TUTORIAL VIDEO
│ 3️⃣ CHANNEL
╰───◐
> ${settings.footer}
`;

await sock.sendMessage(m.chat, {
  image: { url: settings.menuImage },
  caption: text,
  contextInfo: {
    externalAdReply: {
      title: "E TECH OFC - Bot Pairing",
      body: `Your Pair ID: ${pairCode} - Tap to get Pair Code`,
      thumbnailUrl: settings.menuImage,
      sourceUrl: pairingSite,
      mediaType: 1,
      renderLargerThumbnail: true
    }
  }
}, { quoted: m });

// Also send button with link
await sock.sendMessage(m.chat, {
  text: `*🔗 Get Pair Code Here:*\n${pairingSite}\n\n*Your ID:* ${pairCode}\n\n> Powered by E TECH OFC`,
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true
  }
}, { quoted: m });
}
}
