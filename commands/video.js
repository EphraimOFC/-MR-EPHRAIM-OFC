const ytSearch = require('yt-search');
const axios = require('axios');

module.exports = async (sock, m, args, { from }) => {
  if (!args.length) return sock.sendMessage(from, { text: "❌ Use:.video EXQ Zuva Rese" }, { quoted: m });

  const query = args.join(" ");
  const search = await ytSearch(query);
  const video = search.videos[0];
  if (!video) return sock.sendMessage(from, { text: "❌ Video not found" }, { quoted: m });

  // SAME INTERFACE AS YOUR.song PHOTO
  const caption = `❤️•─────────⊹⊱•❁•⊰⊹─────────•❤️
         🎬 VIDEO DOWNLOADER 🎬
❤️•─────────⊹⊱•❁•⊰⊹─────────•❤️

✨ Title :- ${video.title}
👤 Author :- ${video.author.name}
👁️ Views :- ${video.views.toLocaleString()}
⏳ Ago :- ${video.ago}
▶️ Duration :- ${video.timestamp}

┌─「 REPLY TO DOWNLOAD 」
│ 🎬 VIDEO
│ 📄 DOCUMENT
└───────────────

| etechofc.vercel.app </> Powered by E TECH OFC`;

  await sock.sendMessage(from, {
    image: { url: video.thumbnail },
    caption: caption,
    footer: "etechofc.vercel.app </> Powered by E TECH OFC",
    buttons: [
      { buttonId: `vid_${video.url}`, buttonText: { displayText: "🎬 Video" }, type: 1 },
      { buttonId: `viddoc_${video.url}`, buttonText: { displayText: "📄 Document" }, type: 1 }
    ],
    headerType: 4
  }, { quoted: m });
};

// ADD THIS TO SAME LISTENER IN index.js (under the audio one)
/*
  if (id.startsWith("vid_") || id.startsWith("viddoc_")) {
    const url = id.replace("vid_", "").replace("viddoc_", "");
    const isDoc = id.startsWith("viddoc_");

    try {
      const { data } = await axios.get(`https://api.davidcyriltech.my.id/download/ytmp4?url=${url}`);
      const dl = data.result.downloadUrl;

      if (isDoc) {
        await sock.sendMessage(msg.key.remoteJid, {
          document: { url: dl },
          mimetype: "video/mp4",
          fileName: `${Date.now()}.mp4`,
          caption: "etechofc.vercel.app </> Powered by E TECH OFC"
        }, { quoted: msg });
      } else {
        await sock.sendMessage(msg.key.remoteJid, {
          video: { url: dl },
          mimetype: "video/mp4",
          caption: "etechofc.vercel.app </> Powered by E TECH OFC"
        }, { quoted: msg });
      }
    } catch {
      await sock.sendMessage(msg.key.remoteJid, { text: "❌ Video download failed" }, { quoted: msg });
    }
  }
*/
