const { spotify } = require('../lib/sasaApi')

module.exports = {
  name: "spotify",
  alias: ["sp", "spot"],
  async execute(sock, m, args, settings) {
    const q = args.join(" ").trim()
    if (!q) return sock.sendMessage(m.chat, { text: `❌ Usage: .spotify <song/artist>\n\n${settings.footer}` }, { quoted: m })

    try {
      const data = await spotify(q)
      const result = data?.result || data?.data || data
      const items = Array.isArray(result) ? result : (result?.tracks || result?.results || result?.data || [])
      const rows = (Array.isArray(items) ? items : [result])
        .filter(Boolean)
        .slice(0, 5)
        .map((x, i) => `${i + 1}. ${x.title || x.name || "Unknown"} — ${x.artist || x.artists || x.author || ""}`)
        .join("\n")

      await sock.sendMessage(m.chat, {
        text: `*🎵 SPOTIFY SEARCH*\n\n*Query:* ${q}\n\n${rows || JSON.stringify(result, null, 2).slice(0, 3000)}\n\n${settings.footer}`
      }, { quoted: m })
    } catch (e) {
      await sock.sendMessage(m.chat, { text: `❌ Spotify search failed\n${e.message}\n\n${settings.footer}` }, { quoted: m })
    }
  }
}
