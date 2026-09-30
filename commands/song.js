module.exports = {
name: "song",
execute: async (sock, m, args, settings) => {
if(!args[0]) return sock.sendMessage(m.chat, { text: `*E TECH OFC SONG DL*\n\nUsage:.song Alan Walker - Faded\n\n> ${settings.footer}` }, { quoted: m });
const query = args.join(" ");
await sock.sendMessage(m.chat, { text: `🎵 *Searching:* ${query}...` }, { quoted: m });
try {
  // Anti-ban delay before download
  await new Promise(r => setTimeout(r, 1500));
  const res = await fetch(`https://api.davidcyriltech.my.id/song?query=${encodeURIComponent(query)}`);
  const data = await res.json();
  if(!data.result ||!data.result.download_url) throw new Error("Not found");

  await sock.sendMessage(m.chat, {
    image: { url: data.result.thumbnail },
    caption: `╭───◐\n│ 🎵 *${data.result.title}*\n│ 👤 ${data.result.author || 'YouTube'}\n│ ⏱️ ${data.result.duration || ''}\n│ 🔗 ${settings.channelLink}\n╰───◐\n\n> Downloading audio...`,
    contextInfo: {
      externalAdReply: {
        title: data.result.title,
        body: "E TECH OFC - Song Download",
        thumbnailUrl: settings.menuImage,
        sourceUrl: settings.channelLink,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m });

  await sock.sendMessage(m.chat, {
    audio: { url: data.result.download_url },
    mimetype: 'audio/mpeg',
    fileName: `${data.result.title}.mp3`,
    ptt: false,
    contextInfo: {
      externalAdReply: {
        title: data.result.title,
        body: "Powered By E TECH OFC | 2347072956206",
        thumbnailUrl: data.result.thumbnail,
        sourceUrl: settings.channelLink,
        mediaType: 2
      }
    }
  }, { quoted: m });

} catch(e){
  console.log(e);
  await sock.sendMessage(m.chat, { text: `❌ Failed. Try another name.\n> ${settings.footer}` }, { quoted: m });
}
}
}
