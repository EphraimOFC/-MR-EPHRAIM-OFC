const axios = require('axios')
const { ytMp3 } = require('../lib/sasaApi')
module.exports = {
name: "ytmp3",
alias: ["ytmp3dl","yta"],
async execute(sock, m, args, settings){
try { await sock.sendMessage(m.chat, { react: { text: "✅️", key: m.key } }) } catch{}
let url = args[0]
if(!url) {
  try { await sock.sendMessage(m.chat, { react: { text: "❌️", key: m.key } }) } catch{}
  return sock.sendMessage(m.chat, { text: `❌ Paste YT link\nEx:.ytmp3 https://youtu.be/...` }, { quoted: m })
}
try {
  try { await sock.sendMessage(m.chat, { react: { text: "⬇️", key: m.key } }) } catch{}
  let data = await ytMp3(url, "128", false)
  let result = data?.result || data?.data || data
  let dlUrl = result?.download_url || result?.downloadUrl || result?.url || result?.link || result?.audio || result?.audio_url
  let title = result?.title || data.title || "YouTube Audio"
  if(!dlUrl) throw new Error("No link")

  await sock.sendMessage(m.chat, { audio: { url: dlUrl }, mimetype: "audio/mpeg", fileName: `${title}.mp3` }, { quoted: m })
  try { await sock.sendMessage(m.chat, { react: { text: "✅️", key: m.key } }) } catch{}
} catch(e){
  try { await sock.sendMessage(m.chat, { react: { text: "❌️", key: m.key } }) } catch{}
  sock.sendMessage(m.chat, { text: `❌ Failed to download YT MP3` }, { quoted: m })
}
}
}
