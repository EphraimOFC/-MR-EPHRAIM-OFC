module.exports = {
  name: "ping",
  execute: async (sock, m, args, settings) => {
    const start = Date.now()
    const uptime = process.uptime()
    const hours = Math.floor(uptime / 3600)
    const mins = Math.floor((uptime % 3600) / 60)
    const secs = Math.floor(uptime % 60)

    const text = `
╭───◐ *E TECH OFC PING* ◐───
│ ⚡ *Speed:* ${Date.now() - start}ms
│ ⏱️ *Uptime:* ${hours}h ${mins}m ${secs}s
│ 🤖 *Bot:* E TECH OFC V2.0
│ 👑 *Owner:* MR EPHRAIM OFC
│ 📞 *Main:* 2347072956206
│ 📞 *Backup:* 2348108717744
╰───◐
✅ *Active & Stable*

${settings.footer}`

    await sock.sendMessage(m.chat, { text }, { quoted: m })
  }
}