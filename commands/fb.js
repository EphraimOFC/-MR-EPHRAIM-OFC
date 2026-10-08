const { facebook } = require('../lib/sasaApi')

module.exports = {
name: "fb",
alias: ["facebook"],
async execute(sock, m, args, settings){
  try { await sock.sendMessage(m.chat, { react: { text: "⬇️", key: m.key } }) } catch {}
  const url = args[0]

  if(!url){
    try { await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } }) } catch {}
    return sock.sendMessage(
      m.chat,
      { text: `❌ Paste FB link\nEx: .fb https://www.facebook.com/...` },
      { quoted: m }
    )
  }

  try{
    await sock.sendPresenceUpdate('composing', m.chat)

    const data = await facebook(url, false)
    const result = data?.result || data?.data || data
    const videoUrl =
      result?.hd ||
      result?.hd_url ||
      result?.sd ||
      result?.sd_url ||
      result?.video ||
      result?.download_url ||
      result?.url

    const title = result?.title || result?.caption || 'Facebook Video'

    if(!videoUrl) throw new Error('API returned no downloadable video URL')

    await sock.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption: `*📘 FB DOWNLOADER*\n📌 ${title}\n\n${settings.footer}`
      },
      { quoted: m }
    )

    try { await sock.sendMessage(m.chat, { react: { text: "✅", key: m.key } }) } catch {}
  }catch(e){
    console.error('FB DOWNLOADER:', e.response?.data || e.message)
    try { await sock.sendMessage(m.chat, { react: { text: "❌", key: m.key } }) } catch {}
    await sock.sendMessage(
      m.chat,
      { text: `❌ Failed to download Facebook video.\n\n${e.message}\n\n${settings.footer}` },
      { quoted: m }
    )
  }
}
}
