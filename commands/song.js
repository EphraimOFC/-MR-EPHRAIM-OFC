const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: "song",
  alias: ["play", "music"],
  async execute(sock, m, args, settings) {
    const chat = m.chat;
    let query = args.join(" ").trim();
    let format = "audio";

    if (["audio", "document", "voice"].includes(args[args.length - 1]?.toLowerCase())) {
      format = args[args.length - 1].toLowerCase();
      query = args.slice(0, -1).join(" ").trim();
    }

    if (global.songCache?.[chat] && ["audio", "document", "voice"].includes(query.toLowerCase())) {
      format = query.toLowerCase();
      query = global.songCache[chat].query;
    }

    if (!query) {
      return sock.sendMessage(chat, {
        text: `❌ Provide song name\nExample: .song Calm Down\n\n${settings.footer}`
      }, { quoted: m });
    }

    let filePath;
    try {
      await sock.sendMessage(chat, { react: { text: "⏳", key: m.key } });

      const search = await yts(query);
      if (!search.videos?.length) throw new Error("No YouTube results found for that song.");

      const video = search.videos[0];
      const url = video.url;
      global.songCache = global.songCache || {};
      global.songCache[chat] = { query, url, title: video.title };

      const tempDir = path.join(process.cwd(), "temp");
      fs.mkdirSync(tempDir, { recursive: true });
      filePath = path.join(tempDir, `song-${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`);

      // YouTube changes which player clients expose playable formats.
      // Try a few supported clients instead of failing on the first response.
      const clients = ["ANDROID", "TV", "IOS", "WEB_EMBEDDED"];
      let info;
      let lastError;

      for (const client of clients) {
        try {
          info = await ytdl.getInfo(url, { playerClients: [client] });
          const playable = ytdl.filterFormats(info.formats, "audioonly");
          if (playable.length) break;
          info = null;
          lastError = new Error(`No audio formats were returned by YouTube (${client}).`);
        } catch (err) {
          info = null;
          lastError = err;
        }
      }

      if (!info) {
        throw new Error(`YouTube did not provide playable audio formats. ${lastError?.message || "Try again later."}`);
      }

      const audioFormats = ytdl.filterFormats(info.formats, "audioonly");
      if (!audioFormats.length) throw new Error("No audio-only format is available for this video.");

      const stream = ytdl.downloadFromInfo(info, {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1 << 25
      });

      await new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(filePath);
        stream.once("error", reject);
        writeStream.once("error", reject);
        writeStream.once("finish", resolve);
        stream.pipe(writeStream);
      });

      const audio = fs.readFileSync(filePath);
      if (!audio.length) throw new Error("The downloaded audio file was empty.");

      const caption = `*🎵 ${video.title}*\n*⏱️ ${video.timestamp || "Unknown"}*\n*👁️ ${video.views || "Unknown"}*\n*📅 ${video.ago || "Unknown"}*\n\n*${settings.footer}*`;

      if (format === "document") {
        await sock.sendMessage(chat, {
          document: audio,
          mimetype: "audio/mpeg",
          fileName: `${video.title.replace(/[\\/:*?"<>|]/g, "_")}.mp3`,
          caption
        }, { quoted: m });
      } else if (format === "voice") {
        await sock.sendMessage(chat, { audio, mimetype: "audio/mpeg", ptt: true }, { quoted: m });
      } else {
        await sock.sendMessage(chat, { audio, mimetype: "audio/mpeg" }, { quoted: m });
        await sock.sendMessage(chat, { text: caption }, { quoted: m });
      }

      await sock.sendMessage(chat, { react: { text: "✅", key: m.key } });
      await sock.sendMessage(chat, {
        text: `*Reply with format:*\n\n1️⃣ AUDIO\n2️⃣ DOCUMENT\n3️⃣ VOICE\n\n*${settings.footer}*`
      }, { quoted: m });
    } catch (e) {
      console.error("SONG ERROR:", e);
      await sock.sendMessage(chat, { react: { text: "❌", key: m.key } }).catch(() => {});
      const message = /429|too many requests/i.test(e.message)
        ? "YouTube is temporarily rate-limiting the bot. Wait a while and try again."
        : e.message;
      return sock.sendMessage(chat, {
        text: `❌ Song download failed: ${message}\n\nIf it keeps happening, the hosting network may be blocking YouTube.\n\n*${settings.footer}*`
      }, { quoted: m });
    } finally {
      if (filePath && fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (cleanupError) {
          console.error("SONG TEMP CLEANUP ERROR:", cleanupError);
        }
      }
    }
  }
};
