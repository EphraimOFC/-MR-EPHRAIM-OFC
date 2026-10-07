const yts = require('yt-search')
const ytdl = require('@distube/ytdl-core')
const fs = require('fs')
const path = require('path')

// Store last song per chat
global.songCache = global.songCache || {}

module.exports = {
name: "song",
alias: ["play","music"],
async execute(sock, m, args, settings) {
let query = args.join(" ")
let chat = m.chat
let pushName = m.pushName || "User"

// If user replied 1/2/3 for download
if (["1","2","audio"].includes(query.toLowerCase()) || query === "1") {
  let data = global.songCache[chat]
  if (!data) return sock.sendMessage(chat, { text: "❌ No song found, search again" }, { quoted: m })
  return downloadAndSend(sock, m, data, "audio")
}
if (["2","document","doc"].includes(query.toLowerCase())) {
  let data = global.songCache[chat]
  if (!data) return sock.sendMessage(chat, { text: "❌ No song found" }, { quoted: m })
  return downloadAndSend(sock, m, data, "document")
}
if (["3","voice","vn"].includes(query.toLowerCase())) {
  let data = global.songCache[chat]
  if (!data) return sock.sendMessage(chat, { text: "❌ No song found" }, { quoted: m })
  return downloadAndSend(sock, m, data, "voice")
}

if (!query) return sock.sendMessage(chat, { text: "Usage:.song <song name>" }, { quoted: m })

try {
  await sock.sendPresenceUpdate('composing', chat)
  let search = await yts(query)
  let video = search.videos[0]
  if (!video) return sock.sendMessage(chat, { text: "❌ Not found" }, { quoted: m })

  // Save to cache
  global.songCache[chat] = video

  let fancyName = pushName.toUpperCase()
  let title = video.title
  let author = video.author.name
  let views = video.views
  let ago = video.ago
  let duration = video.timestamp

  let txt = `
*🎧⃝⃘̉̉̉━⋆─⋆──❂*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☠︎︎*
*✧ ${fancyName}𓂃✍︎𝄞*
*╰────────────────❂*
 *┏━━━━━━━━━━━❥❥❥*
 *┃* \`𝗦𝗢𝗡𝗚 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥\`
 *┗━━━━━━━━━━━❥❥❥*

*📌 Title :-* ${title}
*👤 Author :-* ${author}
*👁️ Views :-* ${views}
*⏳ Ago :-* ${ago}
*⏱️ Duration :-* ${duration}

*0:00 ⊲⊲ ▐ ▌ ⊳⊳ ${duration}*
*━━━━━⬤───────*

*┏━「 𝚁𝚎𝙿𝙻𝚈 𝙽𝚄𝙼𝙱𝚎𝚁 ⤵️ 」*
*┃* 1️⃣ \`Audio\`
*┃* 2️⃣ \`Document\`
*┃* 3️⃣ \`Voice\`
*┗━━━━━━━━━━❥❥❥*

👨‍💻 Develop By *ᴍʀ ᴇᴘʜʀᴀɪᴍ ᴏꜰᴄ*
> *© Powered by E TECH OFC™*
`

  // Try send with buttons - RQueen style
  try {
    // If you have button-helper
    if (global.buttonHelper) {
      let buttons = [
        { id: "1", text: "Audio 🎧" },
        { id: "2", text: "Document 📁" },
        { id: "3", text: "Voice 🎙️" }
      ]
      // helper usage depends on your version
      await sock.sendMessage(chat, {
        text: txt,
        buttons: buttons,
        image: { url: video.thumbnail }
      }, { quoted: m })
    } else {
      // Native Flow buttons - works on latest Baileys
      await sock.sendMessage(chat, {
        image: { url: video.thumbnail },
        caption: txt,
        footer: "E TECH OFC™",
        buttons: [
          { buttonId: "1", buttonText: { displayText: "Audio 🎧" }, type: 1 },
          { buttonId: "2", buttonText: { displayText: "Document 📁" }, type: 1 },
          { buttonId: "3", buttonText: { displayText: "Voice 🎙️" }, type: 1 }
        ],
        headerType: 4
      }, { quoted: m })
    }
  } catch (e) {
    // Fallback without buttons
    await sock.sendMessage(chat, { image: { url: video.thumbnail }, caption: txt }, { quoted: m })
  }

} catch (err) {
  console.log(err)
  sock.sendMessage(chat, { text: "❌ Error: " + err.message }, { quoted: m })
}
}
}

async function downloadAndSend(sock, m, video, type) {
try {
  await sock.sendMessage(m.chat, { text: `⏳ Downloading *${video.title}* as ${type}...` }, { quoted: m })
  let stream = ytdl(video.url, { filter: "audioonly", quality: "highestaudio" })
  let filePath = path.join(__dirname, `../temp/${Date.now()}.mp3`)
  if (!fs.existsSync(path.join(__dirname, "../temp"))) fs.mkdirSync(path.join(__dirname, "../temp"), { recursive: true })
  let write = fs.createWriteStream(filePath)
  stream.pipe(write)
  await new Promise(res => write.on('finish', res))

  if (type === "audio") {
    await sock.sendMessage(m.chat, { audio: fs.readFileSync(filePath), mimetype: 'audio/mpeg', fileName: `${video.title}.mp3` }, { quoted: m })
  } else if (type === "document") {
    await sock.sendMessage(m.chat, { document: fs.readFileSync(filePath), mimetype: 'audio/mpeg', fileName: `${video.title}.mp3` }, { quoted: m })
  } else {
    await sock.sendMessage(m.chat, { audio: fs.readFileSync(filePath), mimetype: 'audio/mpeg', ptt: true }, { quoted: m })
  }
  fs.unlinkSync(filePath)
} catch (e) {
  console.log(e)
  sock.sendMessage(m.chat, { text: "❌ Download failed" }, { quoted: m })
}
 }
