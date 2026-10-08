const yts = require('yt-search')
const ytdl = require('@distube/ytdl-core')
const { Readable } = require('stream')
const fs = require('fs')
const path = require('path')
const { sendInteractive, quickReply } = require('../ui')

global.songCache = global.songCache || {}

module.exports = {
name: "song",
alias: ["play", "music"],

async execute(sock, m, args, settings) {
const chat = m.key?.remoteJid
const pushName = m.pushName || "User"
const bodyText = args.join(" ").toLowerCase().trim()

// Never attempt to send to an invalid JID
if (!chat || !chat.includes("@")) return

// BUTTON / SELECTION
if (["audio", "document", "doc", "voice", "vn", "ptt"].includes(bodyText)) {
  try {
    await sock.sendMessage(chat, {
      react: { text: "✅️", key: m.key }
    })
  } catch {}

  const data = global.songCache[chat]

  if (!data) {
    return sock.sendMessage(
      chat,
      {
        text: `❌ Session expired, search again\n\n${settings.footer}`
      },
      { quoted: m }
    )
  }

  const type =
    bodyText === "doc"
      ? "document"
      : ["vn", "ptt"].includes(bodyText)
        ? "voice"
        : bodyText

  return downloadAndSend(sock, m, data, type, settings)
}

// INITIAL SEARCH
try {
  await sock.sendMessage(chat, {
    react: { text: "✅️", key: m.key }
  })
} catch {}

const query = args.join(" ").trim()

if (!query) {
  try {
    await sock.sendMessage(chat, {
      react: { text: "❌️", key: m.key }
    })
  } catch {}

  return sock.sendMessage(
    chat,
    {
      text: `❌ Usage: .song <song name>\n\nEx: .song Calm Down\n\n${settings.footer}`
    },
    { quoted: m }
  )
}

try {
  await sock.sendPresenceUpdate("composing", chat)

  const search = await yts(query)
  const video = search.videos?.[0]

  if (!video) {
    try {
      await sock.sendMessage(chat, {
        react: { text: "❌️", key: m.key }
      })
    } catch {}

    return sock.sendMessage(
      chat,
      { text: `❌ Song not found\n\n${settings.footer}` },
      { quoted: m }
    )
  }

  // Save search result for the button selection
  global.songCache[chat] = video

  const fancyName = pushName

  const txt = `*🎧⃝⃘̉̉̉━⋆─⋆──❂* 
*┊ ┊ ┊ ┊ ┊* 
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀* 
*┊ ☠︎︎* 
*✧ ${fancyName}𓂃✍︎𝄞* 
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
 
*Choose Download Format ⤵️*`;

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

} catch (err) {
  console.log("SONG SEARCH ERROR:", err)

  try {
    await sock.sendMessage(chat, {
      react: { text: "❌️", key: m.key }
    })
  } catch {}

  await sock.sendMessage(
    chat,
    {
      text: `❌ Error: ${err.message}\n\n${settings.footer}`
    },
    { quoted: m }
  )
}

}
}

async function downloadAndSend(sock, m, video, type, settings) {
const chat = m.key?.remoteJid

if (!chat || !chat.includes("@")) return

let filePath = null

try {
try {
await sock.sendMessage(chat, {
react: { text: "⬇️", key: m.key }
})
} catch {}

await sock.sendMessage(
  chat,
  {
    text: `⏳ Downloading *${video.title}* as ${type}...`
  },
  { quoted: m }
)

// Make temp directory
const tempDir = path.join(__dirname, "../temp")

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true })
}

filePath = path.join(
  tempDir,
  `${Date.now()}-${Math.random().toString(36).slice(2)}.mp3`
)

/*
 * PRIMARY DOWNLOADER
 * YouTube.js InnerTube first; ytdl-core is only a fallback.
 * This avoids relying on the direct YouTube request that is returning HTTP 429.
 */
let downloadFormat = "m4a"
let streamError = null

try {
  const { Innertube } = await import("youtubei.js")
  const youtube = await Innertube.create()
  const videoId = video.videoId || video.id || String(video.url).split("v=")[1]?.split("&")[0]
  if (!videoId) throw new Error("YouTube video ID unavailable")
  const webStream = await youtube.download(videoId, {
    type: "audio",
    quality: "best",
    format: "mp4"
  })
  const nodeStream = Readable.fromWeb(webStream)
  filePath = filePath.replace(/\\.mp3$/, ".m4a")
  const writeStream = fs.createWriteStream(filePath)

  await new Promise((resolve, reject) => {
    nodeStream.on("error", reject)
    writeStream.on("error", reject)
    writeStream.on("finish", resolve)
    nodeStream.pipe(writeStream)
  })
} catch (e) {
  streamError = e
  console.log("YOUTUBE.JS DOWNLOAD FAILED, TRYING YTDL:", e.message)

  const stream = ytdl(video.url, {
    filter: "audioonly",
    quality: "highestaudio",
    highWaterMark: 1 << 25,
    requestOptions: {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/154.0 Safari/537.36"
      }
    }
  })

  const writeStream = fs.createWriteStream(filePath)

  await new Promise((resolve, reject) => {
    stream.on("error", reject)
    writeStream.on("error", reject)
    writeStream.on("finish", resolve)
    stream.pipe(writeStream)
  })
}

if (streamError && !fs.existsSync(filePath)) {
  throw streamError
}

if (!fs.existsSync(filePath)) {
  throw new Error("Audio file was not created")
}

const stat = fs.statSync(filePath)

if (stat.size === 0) {
  throw new Error("Downloaded audio is empty")
}

const sizeMB = (stat.size / (1024 * 1024)).toFixed(2)

const safeTitle = String(video.title || "song")
  .replace(/[\\/:*?"<>|]/g, "")
  .slice(0, 100)

const fileName = `${safeTitle}.${downloadFormat}`

const fileCaption =
  `*🎵 ${video.title}*\n` +
  `*👤 Artist:* ${video.author?.name || "Unknown"}\n` +
  `*⏱️ Duration:* ${video.timestamp || "Unknown"}\n` +
  `*📦 Size:* ${sizeMB} MB\n\n` +
  `${settings.footer}`

const audioBuffer = fs.readFileSync(filePath)

// AUDIO
if (type === "audio") {
  await sock.sendMessage(
    chat,
    {
      audio: audioBuffer,
      mimetype: downloadFormat === "m4a" ? "audio/mp4" : "audio/mpeg",
      fileName
    },
    { quoted: m }
  )

  await sock.sendMessage(
    chat,
    { text: fileCaption },
    { quoted: m }
  )
}

// DOCUMENT
else if (type === "document") {
  await sock.sendMessage(
    chat,
    {
      document: audioBuffer,
      mimetype: downloadFormat === "m4a" ? "audio/mp4" : "audio/mpeg",
      fileName,
      caption: fileCaption
    },
    { quoted: m }
  )
}

// VOICE NOTE
else if (type === "voice") {
  await sock.sendMessage(
    chat,
    {
      audio: audioBuffer,
      mimetype: downloadFormat === "m4a" ? "audio/mp4" : "audio/mpeg",
      ptt: true
    },
    { quoted: m }
  )

  await sock.sendMessage(
    chat,
    { text: fileCaption },
    { quoted: m }
  )
}

// Clear cache after successful download
delete global.songCache[chat]

try {
  await sock.sendMessage(chat, {
    react: { text: "✅️", key: m.key }
  })
} catch {}

} catch (e) {
console.log("SONG DOWNLOAD ERROR:", e)

try {
  await sock.sendMessage(chat, {
    react: { text: "❌️", key: m.key }
  })
} catch {}

try {
  await sock.sendMessage(
    chat,
    {
      text: `❌ Download failed\n\n${e.message}\n\n${settings.footer}`
    },
    { quoted: m }
  )
} catch {}

} finally {
// Always remove temporary file
if (filePath && fs.existsSync(filePath)) {
try {
fs.unlinkSync(filePath)
} catch {}
}
}
}
