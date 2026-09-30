module.exports = {
name: "song",
execute: async (sock, m, args, settings) => {
if(!args[0]) return sock.sendMessage(m.chat, { text: `*E TECH OFC SONG DL*\n\nUsage:.song Alan Walker - Faded\n\n> ${settings.footer}` }, { quoted: m });
const query = args.join(" ");
await sock.sendMessage(m.chat, { text: `🎵 *Searching:* ${query}...` }, { quoted: m });
try {
  // Using David Cyril API (fast, no key)
  const res = await fetch(`https://api.davidcyriltech.my.id/song?query=${encodeURIComponent(query)}`);
  const data = await res.json();
  if(!data.result ||!data.result.download_url){
    throw new Error("Not found");
  }
  await sock.sendMessage(m.chat, {
    image: { url: data.result.thumbnail },
    caption: `╭───◐\n│ 🎵 *${data.result.title}*\n│ 👤 ${data.result.author || 'YouTube'}\n│ ⏱️ ${data.result.duration || ''}\n╰───◐\n\n> Downloading audio... Powered by ${settings.footer}`
  }, { quoted: m });

  await sock.sendMessage(m.chat, {
    audio: { url: data.result.download_url },
    mimetype: 'audio/mpeg',
    fileName: `${data.result.title}.mp3`,
    contextInfo: {
      externalAdReply: {
        title: data.result.title,
        body: "E TECH OFC - Song Download",
        thumbnailUrl: data.result.thumbnail,
        sourceUrl: "https://whatsapp.com/channel/0029VbCrylkDp2Q0MbaKpp16",
        mediaType: 1
      }
    }
  }, { quoted: m });

} catch(e){
  console.log(e);
  await sock.sendMessage(m.chat, { text: `❌ Failed to download song. Try again with different name.\nError: ${e.message}` }, { quoted: m });
}
}
}
