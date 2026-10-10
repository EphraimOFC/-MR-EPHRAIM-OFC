const yts = require('yt-search')
const fs = require('fs')
const path = require('path')

global.songCache = global.songCache || {}
global.__ytDownloader = global.__ytDownloader || null

async function getYoutube() {
  if (!global.__ytDownloader) {
    const { Innertube, UniversalCache } = await import('youtubei.js')
    global.__ytDownloader = await Innertube.create({
      cache: new UniversalCache(false),
      generate_session_locally: true
    })
  }
  return global.__ytDownloader
}

module.exports = {
  name: "song",
  alias: ["play", "music"],
  async execute(sock, m, args, settings) {
    const chat = m.chat || m.key?.remoteJid
    const sender = m.key?.participant || m.key?.remoteJid || m.key?.remoteJid
    const cacheKey = `${chat}:${sender}`
    const pushName = m.pushName || "User"
    const bodyText = args.join(" ").toLowerCase().trim()

    // Button clicks
    if (["audio","etech_song_audio","1","1️⃣"].includes(bodyText)) {
      const data = global.songCache[cacheKey] || global.songCache[chat]
      if (!data) return sock.sendMessage(chat, { text: `❌ Session expired, search again\n\n${settings.footer}` }, { quoted: m })
      return downloadAndSend(sock, m, data, "audio", settings)
    }
    if (["document","doc","etech_song_document","2","2️⃣"].includes(bodyText)) {
      const data = global.songCache[cacheKey] || global.songCache[chat]
      if (!data) return sock.sendMessage(chat, { text: `❌ Session expired, search again\n\n${settings.footer}` }, { quoted: m })
      return downloadAndSend(sock, m, data, "document", settings)
    }

    const query = args.join(" ").trim()
    if (!query) return sock.sendMessage(chat, { text: `❌ Usage:.song <name>\n\n${settings.footer}` }, { quoted: m })

    try {
      await sock.sendMessage(chat, { react: { text: "🔎", key: m.key } }).catch(()=>{})
      const search = await yts(query)
      const video = search.videos?.[0]
      if (!video) return sock.sendMessage(chat, { text: `❌ Not found\n\n${settings.footer}` }, { quoted: m })

      global.songCache[cacheKey] = video
      global.songCache[chat] = video

      const txt = `*🎧⃝⃘̉̉̉━⋆─⋆──❂*\n*┊ ┊ ┊ ┊ ┊*\n*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*\n*┊ ☠︎︎*\n*✧ ${pushName}𓂃✍︎𝄞*\n*╰────────────────❂*\n*┏━━━━━━━━━━━❥❥❥*\n*┃* \`𝗦𝗢𝗡𝗚 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥\`\n*┗━━━━━━━━━━━❥❥❥*\n\n*📌 Title :-* ${video.title}\n*👤 Author :-* ${video.author?.name || "Unknown"}\n*👁️ Views :-* ${video.views || "Unknown"}\n*⏳ Ago :-* ${video.ago || "Unknown"}\n*⏱️ Duration :-* ${video.timestamp || "Unknown"}\n\n*0:00 ⊲⊲ ▐ ▌ ⊳⊳ ${video.timestamp || "0:00"}*\n*━━━━━⬤───────*\n\n*┏━「 𝗖𝗛𝗢𝗢𝗦𝗘 𝗙𝗢𝗥𝗠𝗔𝗧 ⤵️ 」*\n*┃* 1️⃣ \`Audio\`\n*┃* 2️⃣ \`Document\`\n*┗━━━━━━━━━━❥❥❥*\n\n${settings.footer}`

      // THIS WILL SHOW REAL BUTTONS NOW
      await sock.sendMessage(chat, {
        image: { url: video.thumbnail },
        caption: txt,
        footer: settings.footer,
        buttons: [
          { buttonId: "etech_song_audio", buttonText: { displayText: "🎧 AUDIO" }, type: 1 },
          { buttonId: "etech_song_document", buttonText: { displayText: "📄 DOCUMENT" }, type: 1 }
        ],
        headerType: 4
      }, { quoted: m })

    } catch (e) {
      console.error(e)
      await sock.sendMessage(chat, { text: `❌ Error: ${e.message}\n\n${settings.footer}` }, { quoted: m })
    }
  }
}

async function downloadYoutubeAudio(video, outputPath) {
  const yt = await getYoutube()
  const videoId = video.videoId || video.id
  let stream
  try{
    stream = await yt.download(videoId, { type: "audio", quality: "best", client: "ANDROID" })
  }catch{
    stream = await yt.download(videoId, { type: "audio", quality: "best", client: "WEB" })
  }
  const { Utils } = await import('youtubei.js')
  const write = fs.createWriteStream(outputPath)
  for await (const chunk of Utils.streamToIterable(stream)) write.write(Buffer.from(chunk))
  await new Promise(r => write.end(r))
}

async function downloadAndSend(sock, m, video, type, settings) {
  const chat = m.chat || m.key?.remoteJid
  let filePath = null
  try {
    await sock.sendMessage(chat, { react: { text: "⬇️", key: m.key } }).catch(()=>{})
    const tempDir = path.join(__dirname, "../temp")
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })
    const safeTitle = String(video.title).replace(/[\\/:*?"<>|]/g, "").slice(0,60)
    filePath = path.join(tempDir, `${Date.now()}-${safeTitle}.mp3`)
    await downloadYoutubeAudio(video, filePath)
    const buffer = fs.readFileSync(filePath)
    const fileName = `${safeTitle}.mp3`
    if (type === "audio") {
      await sock.sendMessage(chat, { audio: buffer, mimetype: "audio/mpeg", fileName }, { quoted: m })
    } else {
      await sock.sendMessage(chat, { document: buffer, mimetype: "audio/mpeg", fileName, caption: `*🎵 ${video.title}*\n\n${settings.footer}` }, { quoted: m })
    }
  } catch (e) {
    await sock.sendMessage(chat, { text: `❌ Failed: ${e.message}\n\n${settings.footer}` }, { quoted: m })
  } finally {
    if (filePath && fs.existsSync(filePath)) try { fs.unlinkSync(filePath) } catch {}
  }
        }
