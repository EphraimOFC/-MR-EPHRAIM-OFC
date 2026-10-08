const { cinesubzSearch, cinesubzDownload } = require('../lib/sasaApi')

global.cinesubzCache = global.cinesubzCache || {}

module.exports = {
  name: "cinesubz",
  alias: ["csubz"],
  async execute(sock, m, args, settings) {
    const input = args.join(" ").trim()
    if (!input) {
      return sock.sendMessage(m.chat, { text: `❌ Usage: .cinesubz <movie name or URL>\n\n${settings.footer}` }, { quoted: m })
    }

    try {
      if (/^https?:\/\//i.test(input)) {
        const data = await cinesubzDownload(input, false)
        const result = data?.result || data?.data || data
        const url = result?.download_url || result?.downloadUrl || result?.url || result?.link
        if (!url) throw new Error("Cinesubz API returned no download URL")
        return sock.sendMessage(m.chat, {
          document: { url },
          mimetype: "video/mp4",
          fileName: `${result?.title || "movie"}.mp4`,
          caption: `${settings.footer}`
        }, { quoted: m })
      }

      const data = await cinesubzSearch(input, 1)
      const result = data?.result || data?.data || data
      const items = Array.isArray(result) ? result : (result?.results || result?.movies || result?.data || [])
      const rows = (Array.isArray(items) ? items : [result])
        .filter(Boolean)
        .slice(0, 10)
        .map((x, i) => `${i + 1}. ${x.title || x.name || "Unknown"}${x.url ? ` — ${x.url}` : ""}`)
        .join("\n")

      return sock.sendMessage(m.chat, {
        text: `*🎬 CINESUBZ SEARCH*\n\n*Query:* ${input}\n\n${rows || JSON.stringify(result, null, 2).slice(0, 3500)}\n\n${settings.footer}`
      }, { quoted: m })
    } catch (e) {
      return sock.sendMessage(m.chat, { text: `❌ Cinesubz request failed\n${e.message}\n\n${settings.footer}` }, { quoted: m })
    }
  }
}
