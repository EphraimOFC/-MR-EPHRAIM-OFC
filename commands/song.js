const yts = require('yt-search')
const ytdl = require('@distube/ytdl-core')
const fs = require('fs')
const path = require('path')

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

  const fancyName = pushName.toUpperCase()

  const txt = `

*🎧⃝⃘━⋆─⋆──❂*
*┊ ☠︎︎*
*✧ ${fancyName}𓂃✍︎𝄞*
*╰────────────────❂*

*📌 Title:* ${video.title}
*👤 Author:* ${video.author?.name || "Unknown"}
*⏱️ Duration:* ${video.timestamp || "Unknown"}

*Tap Button Below ⤵️*

${settings.footer}
`

  await sock.sendMessage(
    chat,
    {
      image: { url: video.thumbnail },
      caption: txt,
      footer: settings.footer,
      buttons: [
        {
          buttonId: "audio",
          buttonText: { displayText: "Audio 🎧" },
          type: 1
        },
        {
          buttonId: "document",
          buttonText: { displayText: "Document 📁" },
          type: 1
        },
        {
          buttonId: "voice",
          buttonText: { displayText: "Voice 🎙️" },
          type: 1
        }
      ],
      headerType: 4
    },
    { quoted: m }
  )

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
 * @distube/ytdl-core
 */
const stream = ytdl(video.url, {
  filter: "audioonly",
  quality: "highestaudio",
  highWaterMark: 1 << 25
})

const writeStream = fs.createWriteStream(filePath)

await new Promise((resolve, reject) => {
  stream.on("error", reject)
  writeStream.on("error", reject)
  writeStream.on("finish", resolve)

  stream.pipe(writeStream)
})

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

const fileName = `${safeTitle}.mp3`

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
      mimetype: "audio/mpeg",
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
      mimetype: "audio/mpeg",
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
      mimetype: "audio/mpeg",
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
