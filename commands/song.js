const yts = require('yt-search');
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: "song",
  alias: ["play", "music"],
  async execute(sock, m, args, settings) {
    const chat = m.chat;
    try {
      // === STEP 2: DOWNLOAD MODE ===
      const formatArg = args[0]?.toLowerCase();
      if (["audio", "document", "voice", "doc"].includes(formatArg)) {
        const cached = global.songCache[chat];
        if (!cached) return sock.sendMessage(chat, { text: "❌ No song in cache. First do `.song <name>`\n" + settings.footer }, { quoted: m });

        await sock.sendMessage(chat, { react: { text: "⏳", key: m.key } });

        const info = await ytdl.getInfo(cached.url);
        const audioFormat = ytdl.chooseFormat(info.formats, { filter: 'audioonly', quality: 'highestaudio' });

        const tmpPath = path.join(__dirname, `../temp_${Date.now()}.mp3`);
        const stream = ytdl(cached.url, { filter: 'audioonly', quality: 'highestaudio' });
        const write = fs.createWriteStream(tmpPath);
        stream.pipe(write);

        await new Promise((res, rej) => {
          write.on('finish', res);
          write.on('error', rej);
        });

        const buffer = fs.readFileSync(tmpPath);

        if (formatArg === "document" || formatArg === "doc") {
          await sock.sendMessage(chat, { document: buffer, mimetype: "audio/mpeg", fileName: `${cached.title}.mp3` }, { quoted: m });
        } else if (formatArg === "voice") {
          await sock.sendMessage(chat, { audio: buffer, mimetype: "audio/mpeg", ptt: true }, { quoted: m });
        } else {
          await sock.sendMessage(chat, { audio: buffer, mimetype: "audio/mpeg" }, { quoted: m });
        }

        fs.unlinkSync(tmpPath);
        await sock.sendMessage(chat, { react: { text: "✅", key: m.key } });
        return;
      }

      // === STEP 1: SEARCH MODE ===
      if (!args[0]) return sock.sendMessage(chat, { text: `❌ Provide song name\nExample:.song Calm Down\n${settings.footer}` }, { quoted: m });

      await sock.sendMessage(chat, { react: { text: "⏳", key: m.key } });

      const query = args.join(" ");
      const search = await yts(query);
      const video = search.videos[0];
      if (!video) {
        await sock.sendMessage(chat, { react: { text: "❌", key: m.key } });
        return sock.sendMessage(chat, { text: `❌ Not found: ${query}` }, { quoted: m });
      }

      // SAVE TO CACHE FOR DOWNLOAD
      global.songCache[chat] = { url: video.url, title: video.title, videoId: video.videoId };

      let caption = `*🎧⃝⃘̉̉̉━⋆─⋆──❂*\n*┊ ┊ ┊ ┊ ┊*\n*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*\n*┊ ☠︎︎*\n*✧ ${video.title}𓂃✍︎𝄞*\n*╰────────────────❂*\n*┏━━━━━━━━━━━❥❥❥*\n*┃* \`𝗦𝗢𝗡𝗚 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥\`\n*┗━━━━━━━━━━━❥❥❥*\n\n*📌 Title :-* ${video.title}\n*👤 Author :-* ${video.author.name}\n*👁️ Views :-* ${video.views.toLocaleString()}\n*⏳ Ago :-* ${video.ago}\n*⏱️ Duration :-* ${video.timestamp}\n\n*┏━「 𝗖𝗛𝗢𝗢𝗦𝗘 𝗙𝗢𝗥𝗠𝗔𝗧 ⤵️ 」*\n*┗━━━━━━━━━━❥❥❥*\n\n👨‍💻 Develop By *ᴍʀ ᴇᴘʜʀᴀɪᴍ ᴏꜰᴄ*\n> *© Powered by E TECH OFC™*`;

      // FIXED BUTTONS - id matches your index.js handler
      await sock.sendMessage(chat, {
        image: { url: video.thumbnail },
        caption: caption,
        footer: settings.footer,
        buttons: [
          { buttonId: "etech_song_audio", buttonText: { displayText: "🎧 AUDIO" }, type: 1 },
          { buttonId: "etech_song_document", buttonText: { displayText: "📄 DOCUMENT" }, type: 1 }
        ],
        headerType: 4
      }, { quoted: m });

      await sock.sendMessage(chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
      console.error("SONG ERROR:", e);
      await sock.sendMessage(chat, { react: { text: "❌", key: m.key } });
      await sock.sendMessage(chat, { text: `❌ Song Error: ${e.message}\n${settings.footer}` }, { quoted: m });
    }
  }
};
