const yts = require('yt-search')
const fs = require('fs')
const path = require('path')
const { sendInteractive, quickReply } = require('../ui')

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
    const pushName = m.pushName || "User"
    const bodyText = args.join(" ").toLowerCase().trim()
    if (!chat || !chat.includes("@")) return

    if (["audio","document","doc","voice","vn","ptt"].includes(bodyText)) {
      const data = global.songCache[chat]
      if (!data) {
        return sock.sendMessage(chat, { text: `❌ Session expired, search again\n\n${settings.footer}` }, { quoted: m })
      }
      const type = bodyText === "doc" ? "document" : ["vn","ptt"].includes(bodyText) ? "voice" : bodyText
      return downloadAndSend(sock, m, data, type, settings)
    }

    const query = args.join(" ").trim()
    if (!query) {
      return sock.sendMessage(chat, { text: `❌ Usage: .song <song name>\n\nEx: .song Calm Down\n\n${settings.footer}` }, { quoted: m })
    }

    try {
      await sock.sendPresenceUpdate("composing", chat).catch(() => {})
      await sock.sendMessage(chat, { react: { text: "🔎", key: m.key } }).catch(() => {})

      const search = await yts(query)
      const video = search.videos?.[0]
      if (!video) {
        return sock.sendMessage(chat, { text: `❌ Song not found\n\n${settings.footer}` }, { quoted: m })
      }

      global.songCache[chat] = video

      const txt = `*🎧⃝⃘̉̉̉━⋆─⋆──❂*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☠︎︎*
*✧ ${pushName}𓂃✍︎𝄞*
*╰────────────────❂*
*┏━━━━━━━━━━━❥❥❥*
*┃* \`𝗦𝗢𝗡𝗚 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥\`
*┗━━━━━━━━━━━❥❥❥*

*📌 Title :-* ${video.title}
*👤 Author :-* ${video.author?.name || "Unknown"}
*👁️ Views :-* ${video.views || "Unknown"}
*⏳ Ago :-* ${video.ago || "Unknown"}
*⏱️ Duration :-* ${video.timestamp || "Unknown"}

*0:00 ⊲⊲ ▐ ▌ ⊳⊳ ${video.timestamp || "0:00"}*
*━━━━━⬤───────*

`

      await sendInteractive(sock, m, {
        title: "E TECH OFC • SONG",
        body: txt,
        image: video.thumbnail,
        footer: settings.footer,
        buttons: [
          quickReply("🎧 AUDIO", "etech_song_audio"),
          quickReply("📄 DOCUMENT", "etech_song_document"),
          quickReply("🎙️ VOICE", "etech_song_voice")
        ]
      })
      await sock.sendMessage(chat, { text: "Choose AUDIO, DOCUMENT or VOICE above." }, { quoted: m })
    } catch (err) {
      console.error("SONG SEARCH ERROR:", err)
      await sock.sendMessage(chat, { text: `❌ Error: ${err.message}\n\n${settings.footer}` }, { quoted: m }).catch(() => {})
    }
  }
}

async function downloadYoutubeAudio(video, outputPath) {
  const yt = await getYoutube()
  const videoId = video.videoId || video.id || String(video.url).split("v=")[1]?.split("&")[0]
  if (!videoId) throw new Error("Could not determine YouTube video ID")

  const stream = await yt.download(videoId, {
    type: "audio",
    quality: "best",
    client: "WEB"
  })

  const { Utils } = await import('youtubei.js')
  const write = fs.createWriteStream(outputPath)

  try {
    for await (const chunk of Utils.streamToIterable(stream)) {
      write.write(Buffer.from(chunk))
    }
  } finally {
    await new Promise(resolve => write.end(resolve))
  }

  if (!fs.existsSync(outputPath) || fs.statSync(outputPath).size < 10000) {
    throw new Error("YouTube returned an empty audio file")
  }
}

async function downloadAndSend(sock, m, video, type, settings) {
  const chat = m.chat || m.key?.remoteJid
  if (!chat || !chat.includes("@")) return

  let filePath = null
  try {
    await sock.sendMessage(chat, { react: { text: "⬇️", key: m.key } }).catch(() => {})
    await sock.sendMessage(chat, { text: `⏳ Downloading *${video.title}* as ${type}...\n\nThis can take a little while.` }, { quoted: m })

    const tempDir = path.join(__dirname, "../temp")
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

    const safeTitle = String(video.title || "song").replace(/[\\/:*?"<>|]/g, "").slice(0, 80) || "song"
    filePath = path.join(tempDir, `${Date.now()}-${safeTitle}.mp3`)

    await downloadYoutubeAudio(video, filePath)

    const buffer = fs.readFileSync(filePath)
    const fileName = `${safeTitle}.mp3`
    const caption = `*🎵 ${video.title}*\n*👤 Artist:* ${video.author?.name || "Unknown"}\n*⏱️ Duration:* ${video.timestamp || "Unknown"}\n\n${settings.footer}`

    if (type === "audio") {
      await sock.sendMessage(chat, { audio: buffer, mimetype: "audio/mpeg", fileName }, { quoted: m })
      await sock.sendMessage(chat, { text: caption }, { quoted: m })
    } else if (type === "document") {
      await sock.sendMessage(chat, { document: buffer, mimetype: "audio/mpeg", fileName, caption }, { quoted: m })
    } else {
      await sock.sendMessage(chat, { audio: buffer, mimetype: "audio/mpeg", ptt: true }, { quoted: m })
      await sock.sendMessage(chat, { text: caption }, { quoted: m })
    }

    delete global.songCache[chat]
    await sock.sendMessage(chat, { react: { text: "✅", key: m.key } }).catch(() => {})
  } catch (e) {
    console.error("SONG DOWNLOAD ERROR:", e)
    await sock.sendMessage(chat, { text: `❌ Download failed\n\n${e.message}\n\n${settings.footer}` }, { quoted: m }).catch(() => {})
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath) } catch {}
    }
  }
}
