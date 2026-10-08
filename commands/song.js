const yts = require('yt-search')
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
 
`;

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
    await sock.sendMessage(chat, { react: { text: "⬇️", key: m.key } })
  } catch {}

  await sock.sendMessage(
    chat,
    { text: `⏳ Downloading *${video.title}* as ${type}...` },
    { quoted: m }
  )

  const tempDir = path.join(__dirname, "../temp")
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true })

  /*
   * Use the Sasa Dev API for audio downloads.
   * This avoids the YouTube HTTP 429 problem from direct ytdl requests.
   */
  let audioUrl = null
  let result = {}
  try {
    const { ytMp3 } = require("../lib/sasaApi")
    const data = await ytMp3(video.url, "128", false)
    result = data?.result || data?.data || data
    audioUrl = result?.download_url || result?.downloadUrl || result?.url || result?.link || result?.audio || result?.audio_url
  } catch (apiError) {
    console.log("SASA MP3 FALLBACK:", apiError?.response?.status || apiError?.message)
  }

  const title = result?.title || video.title || "song"
  if (!audioUrl) {
    const ytdl = require("@distube/ytdl-core")
    const fallbackPath = path.join(tempDir, `${Date.now()}-song.mp3`)
    const stream = ytdl(video.url, { quality: "highestaudio", filter: "audioonly" })
    const write = fs.createWriteStream(fallbackPath)
    stream.pipe(write)
    await new Promise((resolve, reject) => {
      write.on("finish", resolve)
      write.on("error", reject)
      stream.on("error", reject)
    })
    audioUrl = fallbackPath
  }

  const safeTitle = String(title)
    .replace(/[\\/:*?"<>|]/g, "")
    .slice(0, 100)

  const fileName = `${safeTitle}.mp3`
  const fileCaption =
    `*🎵 ${title}*\\n` +
    `*👤 Artist:* ${video.author?.name || result?.artist || "Unknown"}\\n` +
    `*⏱️ Duration:* ${video.timestamp || result?.duration || "Unknown"}\\n\\n` +
    `${settings.footer}`

  if (type === "audio") {
    await sock.sendMessage(
      chat,
      {
        audio: audioUrl.startsWith("http") ? { url: audioUrl } : { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName
      },
      { quoted: m }
    )
    await sock.sendMessage(chat, { text: fileCaption }, { quoted: m })
  } else if (type === "document") {
    await sock.sendMessage(
      chat,
      {
        document: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName,
        caption: fileCaption
      },
      { quoted: m }
    )
  } else if (type === "voice") {
    await sock.sendMessage(
      chat,
      {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        ptt: true
      },
      { quoted: m }
    )
    await sock.sendMessage(chat, { text: fileCaption }, { quoted: m })
  }

  delete global.songCache[chat]

  try {
    await sock.sendMessage(chat, { react: { text: "✅️", key: m.key } })
  } catch {}
} catch (e) {
  console.log("SONG DOWNLOAD ERROR:", e)

  try {
    await sock.sendMessage(chat, { react: { text: "❌️", key: m.key } })
  } catch {}

  try {
    await sock.sendMessage(
      chat,
      { text: `❌ Download failed\\n\\n${e.message}\\n\\n${settings.footer}` },
      { quoted: m }
    )
  } catch {}
} finally {
  if (filePath && fs.existsSync(filePath)) {
    try { fs.unlinkSync(filePath) } catch {}
  }
}
}
