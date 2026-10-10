const yts = require('yt-search');
const { ytmp3 } = require('@vtext/ytdl-api'); // or your ytdl function
const fs = require('fs');

module.exports = {
  name: "song",
  async execute(sock, m, args) {
    try {
      if (!args[0]) return sock.sendMessage(m.chat, { text: "❌ Provide song name\nExample:.song Calm Down" }, { quoted: m });

      await sock.sendMessage(m.chat, { react: { text: "⏳", key: m.key } });

      const query = args.join(" ");
      const search = await yts(query);
      const video = search.videos[0];
      if (!video) {
        await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
        return sock.sendMessage(m.chat, { text: "❌ Not found" }, { quoted: m });
      }

      let caption = `*🎧⃝⃘̉̉̉━⋆─⋆──❂*\n*┊ ┊ ┊ ┊ ┊*\n*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*\n*┊ ☠︎︎*\n*✧ ${video.title}𓂃✍︎𝄞*\n*╰────────────────❂*\n*┏━━━━━━━━━━━❥❥❥*\n*┃* \`𝗦𝗢𝗡𝗚 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥\`\n*┗━━━━━━━━━━━❥❥❥*\n\n*📌 Title :-* ${video.title}\n*👤 Author :-* ${video.author.name}\n*👁️ Views :-* ${video.views}\n*⏳ Ago :-* ${video.ago}\n*⏱️ Duration :-* ${video.timestamp}\n\n*0:00 ⊲⊲ ▐ ▌ ⊳⊳ ${video.timestamp}*\n*━━━━━⬤───────*\n\n👨‍💻 Develop By *ᴍʀ ᴇᴘʜʀᴀɪᴍ ᴏꜰᴄ*\n> *© Powered by E TECH OFC™*`;

      const buttons = [
        { buttonId: `song_audio_${video.videoId}`, buttonText: { displayText: "🎧 AUDIO" }, type: 1 },
        { buttonId: `song_doc_${video.videoId}`, buttonText: { displayText: "📄 DOCUMENT" }, type: 1 }
      ];

      await sock.sendMessage(m.chat, {
        image: { url: video.thumbnail },
        caption: caption,
        buttons: buttons,
        headerType: 4
      }, { quoted: m });

      await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } });

    } catch (e) {
      console.log(e);
      await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } });
      await sock.sendMessage(m.chat, { text: `❌ Error: ${e.message}` }, { quoted: m });
    }
  }
};
