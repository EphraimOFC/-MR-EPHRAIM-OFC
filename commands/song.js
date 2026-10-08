const yts = require('yt-search')
const axios = require('axios')
const fs = require('fs')
const path = require('path')

global.songCache = global.songCache || {}

module.exports = {
name: "song",
alias: ["play","music"],
async execute(sock, m, args, settings) {
let chat = m.chat
let pushName = m.pushName || "User"
let bodyText = args.join(" ").toLowerCase().trim()

// BUTTON TAP
if (["audio","document","doc","voice","vn","ptt"].includes(bodyText)) {
  try { await sock.sendMessage(chat, { react: { text: "✅️", key: m.key } }) } catch{}
  let data = global.songCache[chat]
  if (!data) return sock.sendMessage(chat, { text: `❌ Session expired, search again\n${settings.footer}` }, { quoted: m })
  let type = bodyText === "doc"? "document" : (bodyText === "vn" || bodyText === "ptt")? "voice" : bodyText
  return downloadAndSend(sock, m, data, type, settings)
}

// INITIAL
try { await sock.sendMessage(chat, { react: { text: "✅️", key: m.key } }) } catch{}
let query = args.join(" ")
if (!query) {
  try { await sock.sendMessage(chat, { react: { text: "❌️", key: m.key } }) } catch{}
  return sock.sendMessage(chat, { text: `❌ Usage:.song <song name>\nEx:.song Calm Down\n\n${settings.footer}` }, { quoted: m })
}

try {
  await sock.sendPresenceUpdate('composing', chat)
  let search = await yts(query)
  let video = search.videos[0]
  if (!video) {
    try { await sock.sendMessage(chat, { react: { text: "❌️", key: m.key } }) } catch{}
    return sock.sendMessage(chat, { text: `❌ Not found` }, { quoted: m })
  }
  global.songCache[chat] = video
  let fancyName = pushName.toUpperCase()

  let txt = `
*🎧⃝⃘̉̉̉━⋆─⋆──❂*
*┊ ☠︎︎*
*✧ ${fancyName}𓂃✍︎𝄞*
*╰────────────────❂*
*📌 Title:* ${video.title}
*👤 Author:* ${video.author.name}
*⏱️ Duration:* ${video.timestamp}

*Tap Button Below ⤵️*

${settings.footer}
`

  await sock.sendMessage(chat, {
    image: { url: video.thumbnail },
    caption: txt,
    footer: settings.footer,
    buttons: [
      { buttonId: "audio", buttonText: { displayText: "Audio 🎧" }, type: 1 },
      { buttonId: "document", buttonText: { displayText: "Document 📁" }, type: 1 },
      { buttonId: "voice", buttonText: { displayText: "Voice 🎙️" }, type: 1 }
    ],
    headerType: 4
  }, { quoted: m })

} catch (err) {
  try { await sock.sendMessage(chat, { react: { text: "❌️", key: m.key } }) } catch{}
  sock.sendMessage(chat, { text: `❌ Error: ${err.message}` }, { quoted: m })
}
}
}

async function downloadAndSend(sock, m, video, type, settings) {
try {
  try { await sock.sendMessage(m.chat, { react: { text: "⬇️", key: m.key } }) } catch{}
  await sock.sendMessage(m.chat, { text: `⏳ Downloading *${video.title}* as ${type}...` }, { quoted: m })

  let audioUrl = null
  try {
    let api = `https://api.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(video.url)}`
    let { data } = await axios.get(api, { timeout: 25000 })
    audioUrl = data.result?.download_url || data.download_url || data.result?.dl_url || data.url
  } catch(e){}

  let filePath = path.join(__dirname, `../temp/${Date.now()}.mp3`)
  if (!fs.existsSync(path.join(__dirname, "../temp"))) fs.mkdirSync(path.join(__dirname, "../temp"), { recursive: true })

  if (audioUrl) {
    let res = await axios.get(audioUrl, { responseType: 'arraybuffer' })
    fs.writeFileSync(filePath, res.data)
  } else {
    const ytdl = require('@distube/ytdl-core')
    let stream = ytdl(video.url, { filter: "audioonly", quality: "highestaudio" })
    let write = fs.createWriteStream(filePath)
    stream.pipe(write)
    await new Promise(res => write.on('finish', res))
  }

  let sizeMB = (fs.statSync(filePath).size / (1024*1024)).toFixed(2)
  let fileCaption = `${video.title}\nDuration: ${video.timestamp}\nSize: ${sizeMB} MB\n\n${settings.footer}`

  if (type === "audio") {
    await sock.sendMessage(m.chat, { audio: fs.readFileSync(filePath), mimetype: 'audio/mpeg', fileName: `${video.title}.mp3` }, { quoted: m })
    await sock.sendMessage(m.chat, { text: fileCaption }, { quoted: m })
  } else if (type === "document") {
    await sock.sendMessage(m.chat, { document: fs.readFileSync(filePath), mimetype: 'audio/mpeg', fileName: `${video.title}.mp3`, caption: fileCaption }, { quoted: m })
  } else {
    await sock.sendMessage(m.chat, { audio: fs.readFileSync(filePath), mimetype: 'audio/mpeg', ptt: true }, { quoted: m })
    await sock.sendMessage(m.chat, { text: fileCaption }, { quoted: m })
  }

  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  try { await sock.sendMessage(m.chat, { react: { text: "✅️", key: m.key } }) } catch{}

} catch (e) {
  console.log(e)
  try { await sock.sendMessage(m.chat, { react: { text: "❌️", key: m.key } }) } catch{}
  sock.sendMessage(m.chat, { text: `❌ Download failed\n${settings.footer}` }, { quoted: m })
}
                                                                    }
