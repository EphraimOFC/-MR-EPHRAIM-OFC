const ytSearch = require('yt-search');
const { chaminduDownload } = require('../lib/media');

module.exports = {
  name: "video",
  alias: ["ytvideo", "ytmp4"],
  execute: async (sock, m, args, settings) => {
    if(!args.length) return sock.sendMessage(m.chat, {
      text: "🎬 *VIDEO DOWNLOADER*\n\nUsage: .video <YouTube title or link> [quality]\nExample: .video Calm Down 720"
    }, {quoted:m});

    let quality = "720";
    const last = String(args[args.length - 1] || "");
    if(/^(144|240|360|480|720|1080)$/.test(last)){
      quality = last;
      args.pop();
    }

    const query = args.join(" ").trim();
    let url = query;
    if(!/^https?:\/\//i.test(query)){
      const search = await ytSearch(query);
      if(!search.videos?.length) return sock.sendMessage(m.chat,{text:"❌ No YouTube video found."},{quoted:m});
      url = search.videos[0].url;
    }

    await sock.sendMessage(m.chat,{
      text:`╭─〔 🎬 VIDEO DOWNLOADER 〕─╮
│ ⚡ Quality: *${quality}p*
│ ⏳ Preparing your video...
╰────────────────────╯`
    },{quoted:m});

    try{
      const media = await chaminduDownload("ytmp4", url, quality);
      await sock.sendMessage(m.chat,{
        video: media.buffer,
        mimetype: media.mimetype || "video/mp4",
        caption:`🎬 *E TECH OFC VIDEO*
\n\nQuality: *${quality}p*
\nSource: YouTube`
      },{quoted:m});
    }catch(error){
      await sock.sendMessage(m.chat,{
        text:`❌ *Video download failed*
\n\n${error.message}
\n\nTry another quality (144/240/360/480/720) or another link.`
      },{quoted:m});
      return false;
    }
    return true;
  }
};
