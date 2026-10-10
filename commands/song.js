const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const YT = require('youtube-sr').default;

module.exports = {
  name: "song",
  alias: ["play","music"],
  async execute(sock, m, args, settings) {
    const chat = m.chat;
    let q = args.join(" ").trim();
    if (!q) q = (m.text || m.body || "").trim();
    const cleanQ = q.toLowerCase();
    const userName = m.pushName || "MR EPHRAIM OFC";
    const fancyName = `✧ ${userName.toUpperCase()} 𓂃✍︎𝄞`;

    if (["1","2"].includes(cleanQ)) {
      const cache = global.songCache?.[chat];
      if (!cache) return sock.sendMessage(chat, { text: `❌ Cache expired` }, { quoted: m });

      const outPath = path.join(__dirname, `../temp/${Date.now()}.mp3`);
      if (!fs.existsSync(path.join(__dirname,'../temp'))) fs.mkdirSync(path.join(__dirname,'../temp'), { recursive: true });

      try {
        const cmd = `yt-dlp -x --audio-format mp3 -o "${outPath}" "${cache.url}"`;
        await new Promise((r,j)=> exec(cmd, e=> e?j(e):r()));
        const buf = fs.readFileSync(outPath);
        const mb = (buf.length/1024/1024).toFixed(1);

        // DYNAMIC - title and size from actual file + ONLY YOUR FOOTER
        const cap = `${cache.title}\nSize: ${mb} MB\n\n👨‍💻 Develop By MR EPHRAIM OFC\n© Powered by E TECH OFC™`;

        if (cleanQ === "2") {
          await sock.sendMessage(chat, { document: buf, mimetype: 'audio/mpeg', fileName: `${cache.title}.mp3`, caption: cap }, { quoted: m });
        } else {
          await sock.sendMessage(chat, { audio: buf, mimetype: 'audio/mpeg' }, { quoted: m });
          await sock.sendMessage(chat, { text: cap }, { quoted: m });
        }
        fs.unlinkSync(outPath);
        delete global.songCache[chat];
      } catch(e){ await sock.sendMessage(chat, { text: `❌ ${e.message}` }, { quoted: m }); }
      return;
    }

    if (!q) return;

    const s = await YT.search(q, { limit: 1 });
    const v = s[0];
    if (!global.songCache) global.songCache = {};
    global.songCache[chat] = { title: v.title, url: `https://youtube.com/watch?v=${v.id}` };

    const txt = `*🎧⃝⃘̉̉̉━⋆─⋆──❂*\n*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*\n*┊ ☠︎︎*\n*${fancyName}*\n*╰────────────────❂*\n *┏━━━━━━━━━━━❥❥❥*\n *┃* \`𝗦𝗢𝗡𝗚 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥\`\n *┗━━━━━━━━━━━❥❥❥*\n\n*📌 Title :-* ${v.title}\n*👤 Author :-* ${v.channel?.name}\n*⏱️ Duration :-* ${v.durationFormatted}\n\n*┏━「 𝚁𝚎𝙿𝙻𝚈 𝙽𝚄𝙼𝙱𝚎𝚁 ⤵️ 」*\n*┃* 1️⃣ \`Audio\`\n*┃* 2️⃣ \`Document\`\n*┗━━━━━━━━━━❥❥❥*\n\n👨‍💻 Develop By *ᴍʀ ᴇᴘʜʀᴀɪᴍ ᴏꜰᴄ*\n> *© Powered by E TECH OFC™*`;

    await sock.sendMessage(chat, { image: { url: v.thumbnail.url }, caption: txt }, { quoted: m });
  }
};