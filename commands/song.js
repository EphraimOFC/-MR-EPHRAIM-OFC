const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: "song",
  alias: ["play","music"],
  async execute(sock, m, args, settings) {
    const chat = m.chat;
    let query = args.join(" ").trim();
    
    // If format specified at end (audio/document/voice)
    let format = "audio";
    if (["audio","document","voice"].includes(args[args.length-1]?.toLowerCase())) {
      format = args[args.length-1].toLowerCase();
      query = args.slice(0,-1).join(" ").trim();
    }

    if (!query) return sock.sendMessage(chat, { text: `❌ Provide song name\nExample: .song Calm Down\n\n${settings.footer}` }, { quoted: m });

    // If user replied to previous search with format
    if (global.songCache && global.songCache[chat] && ["audio","document","voice"].includes(query.toLowerCase())) {
      format = query.toLowerCase();
      query = global.songCache[chat].query;
    }

    try {
      await sock.sendMessage(chat, { react: { text: "⏳", key: m.key } });

      const search = await yts(query);
      if (!search.videos.length) throw new Error("No results");

      const video = search.videos[0];
      const url = video.url;

      // Cache for buttons
      global.songCache[chat] = { query: query, url: url, title: video.title };

      // Create temp folder
      if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');
      let filePath = path.join('./temp', `${Date.now()}.mp3`);

      // Download with @distube/ytdl-core
      const stream = ytdl(url, { 
        filter: 'audioonly',
        quality: 'highestaudio',
        highWaterMark: 1 << 25
      });

      const writeStream = fs.createWriteStream(filePath);
      await new Promise((resolve, reject) => {
        stream.pipe(writeStream);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
        stream.on('error', reject);
      });

      await sock.sendMessage(chat, { react: { text: "✅", key: m.key } });

      const caption = `*🎵 ${video.title}*\n*⏱️ ${video.timestamp}*\n*👁️ ${video.views}*\n*📅 ${video.ago}*\n\n*<\> ${settings.footer}*`;

      if (format === "document") {
        await sock.sendMessage(chat, { document: fs.readFileSync(filePath), mimetype: 'audio/mpeg', fileName: `${video.title}.mp3`, caption: caption }, { quoted: m });
      } else if (format === "voice") {
        await sock.sendMessage(chat, { audio: fs.readFileSync(filePath), mimetype: 'audio/mpeg', ptt: true }, { quoted: m });
      } else {
        await sock.sendMessage(chat, { audio: fs.readFileSync(filePath), mimetype: 'audio/mpeg' }, { quoted: m });
        await sock.sendMessage(chat, { text: caption }, { quoted: m });
      }

      fs.unlinkSync(filePath);

      // Send buttons for next time
      await sock.sendMessage(chat, { 
        text: `*Reply with format:*\n\n1️⃣ AUDIO\n2️⃣ DOCUMENT\n3️⃣ VOICE\n\n*<\> ${settings.footer}*`
      }, { quoted: m });

    } catch (e) {
      console.error("SONG ERROR:", e);
      await sock.sendMessage(chat, { react: { text: "❌", key: m.key } });
      return sock.sendMessage(chat, { text: `❌ Error: ${e.message}\n\nTry another song or check if youtube is blocked on server.\n\n*<\> ${settings.footer}*` }, { quoted: m });
    }
  }
};
