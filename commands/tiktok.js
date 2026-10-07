const axios = require('axios')
module.exports = {
name: "tiktok",
alias: ["tt","tik"],
async execute(sock, m, args, settings){
try { await sock.sendMessage(m.chat, { react: { text: "✅️", key: m.key } }) } catch{}
let url = args[0]
if(!url) {
  try { await sock.sendMessage(m.chat, { react: { text: "❌️", key: m.key } }) } catch{}
  return sock.sendMessage(m.chat, { text: `❌ Paste TikTok link\nEx:.tiktok https://vm.tiktok.com/...` }, { quoted: m })
}
try {
  try { await sock.sendMessage(m.chat, { react: { text: "⬇️", key: m.key } }) } catch{}
  let api = `https://api.davidcyriltech.my.id/tiktok?url=${encodeURIComponent(url)}`
  let { data } = await axios.get(api)
  let videoUrl = data.result?.video || data.result?.hd || data.video || data.download_url
  let title = data.result?.title || data.title || "TikTok"
  if(!videoUrl) throw new Error("No video")

  await sock.sendMessage(m.chat, { video: { url: videoUrl }, caption: `*🎵 TIKTOK DOWNLOADER*\n📌 ${title}\n\n${settings.footer}` }, { quoted: m })
  try { await sock.sendMessage(m.chat, { react: { text: "✅️", key: m.key } }) } catch{}
} catch(e){
  try { await sock.sendMessage(m.chat, { react: { text: "❌️", key: m.key } }) } catch{}
  sock.sendMessage(m.chat, { text: `❌ Failed to download TikTok` }, { quoted: m })
}
}
}
