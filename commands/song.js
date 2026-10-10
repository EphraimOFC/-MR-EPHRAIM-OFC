const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const YT = require('youtube-sr').default;

module.exports = {
  name: "song",
  alias: ["play","music"],
  async execute(sock, m, args, settings) {
    const chat = m.chat;
    const q = args.join(" ").trim();

    // If user already chose format: AUDIO / DOCUMENT / VOICE
    if (["audio","document","voice"].includes(q.toLowerCase())) {
      const cache = global.songCache?.[chat];
      if (!cache) return sock.sendMessage(chat, { text: `*❌⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* No song in cache\n*┗━━━━━━━━━━━━━❂*\n*┃* Use: \`?song yoga asake\`\n*┗━「 ${settings.footer} 」*` }, { quoted: m });

      const { title, url, thumbnail } = cache;
      const outPath = path.join(__dirname, `../temp/${Date.now()}.mp3`);
      if (!fs.existsSync(path.join(__dirname,'../temp'))) fs.mkdirSync(path.join(__dirname,'../temp'));

      await sock.sendMessage(chat, { text: `*⏳⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`DOWNLOADING\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* 🎵 ${title.slice(0,50)}\n*┃* 📥 Format: ${q.toUpperCase()}\n*┃*\n*┗━「 ${settings.footer} 」*` }, { quoted: m });

      try {
        // FIXED: android client bypasses 403
        const cmd = `yt-dlp -x --audio-format mp3 --audio-quality 0 --no-playlist --extractor-args "youtube:player_client=android,web" -o "${outPath}" "${url}"`;
        await new Promise((res, rej) => exec(cmd, (err) => err? rej(err) : res()));

        const buffer = fs.readFileSync(outPath);
        if (q.toLowerCase() === "voice") {
          await sock.sendMessage(chat, { audio: buffer, mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
        } else if (q.toLowerCase() === "document") {
          await sock.sendMessage(chat, { document: buffer, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m });
        } else {
          await sock.sendMessage(chat, { audio: buffer, mimetype: 'audio/mpeg' }, { quoted: m });
        }
        fs.unlinkSync(outPath);
        delete global.songCache[chat];
      } catch(e) {
        return sock.sendMessage(chat, { text: `*❌⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* Download failed\n*┃* ${e.message.slice(0,200)}\n*┗━「 ${settings.footer} 」*` }, { quoted: m });
      }
      return;
    }

    // Step 1: Search
    if (!q) return sock.sendMessage(chat, { text: `*❓⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`SONG\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* Use:?song yoga asake\n*┃*\n*┗━「 ${settings.footer} 」*` }, { quoted: m });

    try {
      await sock.sendMessage(chat, { text: `*🔍⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* Searching: ${q}\n*┗━━━━━━━━━━━━━❂*` }, { quoted: m });
      const search = await YT.search(q, { limit: 1, type: 'video' });
      const video = search[0];
      if (!video) throw new Error("Not found");

      if (!global.songCache) global.songCache = {};
      global.songCache[chat] = { title: video.title, url: `https://youtube.com/watch?v=${video.id}`, thumbnail: video.thumbnail?.url };

      const txt = `*🎵⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`SONG FOUND\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* *Title:* ${video.title}\n*┃* *Duration:* ${video.durationFormatted}\n*┃* *Channel:* ${video.channel?.name}\n*┃*\n*┏━「 CHOOSE FORMAT 」*\n*┃* Reply with:\n*┃* \`AUDIO\` - Normal mp3\n*┃* \`DOCUMENT\` - As file\n*┃* \`VOICE\` - As voice note\n*┗━━━━━━━━━━❥❥❥*\n\n*┃* Or tap button below\n*┃*\n*┗━「 ${settings.footer} 」*`;

      // This will trigger your etech_song_ handler in index.js
      await sock.sendMessage(chat, {
        image: { url: video.thumbnail?.url },
        caption: txt,
        buttons: [
          { buttonId: `etech_song_audio`, buttonText: { displayText: '🎧 AUDIO' }, type: 1 },
          { buttonId: `etech_song_document`, buttonText: { displayText: '📄 DOCUMENT' }, type: 1 },
          { buttonId: `etech_song_voice`, buttonText: { displayText: '🎤 VOICE' }, type: 1 }
        ]
      }, { quoted: m });

    } catch(e) {
      await sock.sendMessage(chat, { text: `*❌⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* Song failed: ${e.message}\n*┗━━━━━━━━━━━━━❂*\n\n*┃* Try again or update yt-dlp\n*┃*\n*┗━「 ${settings.footer} 」*` }, { quoted: m });
    }
  }
};
