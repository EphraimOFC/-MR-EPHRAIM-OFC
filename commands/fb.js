const axios = require('axios')
module.exports = {
name: "fb",
alias: ["facebook"],
async execute(sock, m, args, settings){
try { await sock.sendMessage(m.chat, { react: { text: "✅️", key: m.key } }) } catch{}
let url = args[0]
if(!url) {
  try { await sock.sendMessage(m.chat, { react: { text: "❌️", key: m.key } }) } catch{}
  return sock.sendMessage(m.chat, { text: `❌ Paste FB link\nEx:.fb https://www.facebook.com/...` }, { quoted: m })
}
try {
  try { await sock.sendMessage(m.chat, { react: { text: "⬇️", key: m.key } }) } catch{}
  await sock.sendPresenceUpdate('composing', m.chat)
  let api = `https://api.davidcyriltech.my.id/facebook?url=${encodeURIComponent(url)}`
  let { data } = await axios.get(api)
  // API returns different structure - handle both
  let videoUrl = data.result?.hd || data.result?.sd || data.video || data.url || data.download_url
  let title = data.result?.title || "Facebook Video"
  if(!videoUrl) throw new Error("No video found")

  await sock.sendMessage(m.chat, { video: { url: videoUrl }, caption: `*📘 FB DOWNLOADER*\n📌 ${title}\n\n${settings.footer}` }, { quoted: m })
  try { await sock.sendMessage(m.chat, { react: { text: "✅️", key: m.key } }) } catch{}
} catch(e){
  console.log(e.message)
  try { await sock.sendMessage(m.chat, { react: { text: "❌️", key: m.key } }) } catch{}
  sock.sendMessage(m.chat, { text: `❌ Failed to download FB video` }, { quoted: m })
}
}
}
