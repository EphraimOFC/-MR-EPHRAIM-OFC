const ytSearch = require('yt-search');
const axios = require('axios');

module.exports = async (sock, m, args, { from }) => {
  if (!args.length) return sock.sendMessage(from, { text: "❌ Use:.song zuva rese" }, { quoted: m });

  const query = args.join(" ");
  const search = await ytSearch(query);
  const video = search.videos[0];
  if (!video) return sock.sendMessage(from, { text: "❌ Song not found" }, { quoted: m });

  // SAME INTERFACE AS YOUR PHOTO - NO CHANGE
  const caption = `🤍•─────────⊹⊱•❁•⊰⊹─────────•🤍
         ✨ SONG DOWNLOADER ✨
🤍•─────────⊹⊱•❁•⊰⊹─────────•🤍

✨ Title :- ${video.title}
👤 Author :- ${video.author.name}
👁️ Views :- ${video.views.toLocaleString()}
⏳ Ago :- ${video.ago}
▶️•|||| ||||||||• ${video.timestamp}

┌─「 REPLY TO DOWNLOAD 」
│ 🎵 AUDIO
│ 📄 DOCUMENT
└───────────────

| redqueen.online replaced ↓
| etechofc.vercel.app </> Powered by E TECH OFC`;

  await sock.sendMessage(from, {
    image: { url: video.thumbnail },
    caption: caption,
    footer: "etechofc.vercel.app </> Powered by E TECH OFC",
    buttons: [
      { buttonId: `audio_${video.url}`, buttonText: { displayText: "🎵 Audio" }, type: 1 },
      { buttonId: `doc_${video.url}`, buttonText: { displayText: "📄 Document" }, type: 1 }
    ],
    headerType: 4
  }, { quoted: m });
};

// ADD THIS ONE TIME IN YOUR index.js / bot.js - handles tap
/*
sock.ev.on('messages.upsert', async ({messages}) => {
  const msg = messages[0];
  if (!msg.message?.buttonsResponseMessage) return;
  const id = msg.message.buttonsResponseMessage.selectedButtonId;

  if (id.startsWith("audio_") || id.startsWith("doc_")) {
    const url = id.replace("audio_", "").replace("doc_", "");
    const isDoc = id.startsWith("doc_");

    try {
      const { data } = await axios.get(`https://api.davidcyriltech.my.id/download/ytmp3?url=${url}`);
      const dl = data.result.downloadUrl;

      if (isDoc) {
        await sock.sendMessage(msg.key.remoteJid, {
          document: { url: dl },
          mimetype: "audio/mpeg",
          fileName: `${Date.now()}.mp3`,
          caption: "etechofc.vercel.app </> Powered by E TECH OFC"
        }, { quoted: msg });
      } else {
        await sock.sendMessage(msg.key.remoteJid, {
          audio: { url: dl },
          mimetype: "audio/mpeg"
        }, { quoted: msg });
      }
    } catch {
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ Download failed" }, { quoted: msg });
    }
  }
});
*/
