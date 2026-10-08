const yts = require('yt-search')
const axios = require('axios')
const fs = require('fs')
const path = require('path')

global.videoCache = global.videoCache || {}

module.exports = {
name: "video",
alias: ["ytmp4","mp4"],
async execute(sock, m, args, settings) {
let chat = m.chat
let bodyText = args.join(" ").toLowerCase().trim()

if (["360p","480p","720p","document","video"].includes(bodyText)) {
  try { await sock.sendMessage(chat, { react: { text: "✅️", key: m.key } }) } catch{}
  let data = global.videoCache[chat]
  if (!data) return sock.sendMessage(chat, { text: `❌ Session expired\n${settings.footer}` }, { quoted: m })
  let quality = bodyText.includes("720")? "720" : bodyText.includes("480")? "480" : "360"
  return downloadVideo(sock, m, data, quality, settings)
}

try { await sock.sendMessage(chat, { react: { text: "✅️", key: m.key } }) } catch{}
let query = args.join(" ")
if (!query) {
  try { await sock.sendMessage(chat, { react: { text: "❌️", key: m.key } }) } catch{}
  return sock.sendMessage(chat, { text: `❌ Usage:.video <name>\n${settings.footer}` }, { quoted: m })
}

try {
  await sock.sendPresenceUpdate('composing', chat)
  let search = await yts(query)
  let video = search.videos[0]
  if (!video) {
    try { await sock.sendMessage(chat, { react: { text: "❌️", key: m.key } }) } catch{}
    return sock.sendMessage(chat, { text: `❌ Not found` }, { quoted: m })
  }
  global.videoCache[chat] = video

  let txt = `*🎬 VIDEO DOWNLOADER*\n\n*📌 Title:* ${video.title}\n*⏱️ Duration:* ${video.timestamp}\n\n*Tap Quality Below ⤵️*\n\n${settings.footer}`

  await sock.sendMessage(chat, {
    image: { url: video.thumbnail },
    caption: txt,
    footer: settings.footer,
    buttons: [
      { buttonId: "360p", buttonText: { displayText: "360P 📹" }, type: 1 },
      { buttonId: "480p", buttonText: { displayText: "480P 📹" }, type: 1 },
      { buttonId: "720p", buttonText: { displayText: "720P 📹" }, type: 1 }
    ],
    headerType: 4
  }, { quoted: m })

} catch(err){
  try { await sock.sendMessage(chat, { react: { text: "❌️", key: m.key } }) } catch{}
  sock.sendMessage(chat, { text: `❌ Error: ${err.message}` }, { quoted: m })
}
}
}

async function downloadVideo(sock, m, video, quality, settings){
try{
  try { await sock.sendMessage(m.chat, { react: { text: "⬇️", key: m.key } }) } catch{}
  await sock.sendMessage(m.chat, { text: `⏳ Downloading *${video.title}* [${quality}p]...` }, { quoted: m })

  let videoUrl = null
  try{
    let api = `https://api.davidcyriltech.my.id/youtube/mp4?url=${encodeURIComponent(video.url)}&quality=${quality}`
    let { data } = await axios.get(api, { timeout: 25000 })
    videoUrl = data.result?.download_url || data.download_url || data.url
  }catch(e){}

  let filePath = path.join(__dirname, `../temp/${Date.now()}.mp4`)
  if (!fs.existsSync(path.join(__dirname, "../temp"))) fs.mkdirSync(path.join(__dirname, "../temp"), { recursive: true })

  if (videoUrl) {
    let res = await axios.get(videoUrl, { responseType: 'arraybuffer' })
    fs.writeFileSync(filePath, res.data)
  } else {
    const ytdl = require('@distube/ytdl-core')
    let stream = ytdl(video.url, { quality: quality === "720"? "highest" : "lowest", filter: "audioandvideo" })
    let write = fs.createWriteStream(filePath)
    stream.pipe(write)
    await new Promise(res => write.on('finish', res))
  }

  let sizeMB = (fs.statSync(filePath).size / (1024*1024)).toFixed(2)
  let fileCaption = `${video.title}\nQuality: ${quality}P\nSize: ${sizeMB} MB\n\n${settings.footer}`

  await sock.sendMessage(m.chat, {
    document: fs.readFileSync(filePath),
    mimetype: 'video/mp4',
    fileName: `${video.title} [${quality}p].mp4`,
    caption: fileCaption
  }, { quoted: m })

  if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  try { await sock.sendMessage(m.chat, { react: { text: "✅️", key: m.key } }) } catch{}

}catch(e){
  console.log(e)
  try { await sock.sendMessage(m.chat, { react: { text: "❌️", key: m.key } }) } catch{}
  sock.sendMessage(m.chat, { text: `❌ Video download failed\n${settings.footer}` }, { quoted: m })
}
}
