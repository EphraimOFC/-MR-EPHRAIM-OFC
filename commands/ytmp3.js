const axios = require('axios')
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
  let api = `https://api.davidcyriltech.my.id/youtube/mp3?url=${encodeURIComponent(url)}`
  let { data } = await axios.get(api)
  let dlUrl = data.result?.download_url || data.download_url || data.url
  let title = data.result?.title || data.title || "YouTube Audio"
  if(!dlUrl) throw new Error("No link")
  await sock.sendMessage(m.chat, { audio: { url: dlUrl }, mimetype: "audio/mpeg", fileName: `${title}.mp3` }, { quoted: m })
  try { await sock.sendMessage(m.chat, { react: { text: "✅️", key: m.key } }) } catch{}
} catch(e){
  try { await sock.sendMessage(m.chat, { react: { text: "❌️", key: m.key } }) } catch{}
  sock.sendMessage(m.chat, { text: `❌ Failed to download YT MP3` }, { quoted: m })
}
}
}
