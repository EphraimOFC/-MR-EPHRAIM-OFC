module.exports = {
name: "ping",
async execute(sock, m, args, settings) {
  const chat = m.chat
  const start = Date.now()

  try {
    await sock.sendMessage(chat, { react: { text: "🏓", key: m.key } })
  } catch {}

  const speed = Date.now() - start
  const upSec = process.uptime()
  const mins = Math.floor(upSec / 60)
  const hrs = Math.floor(mins / 60)
  const uptime = hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`
  const mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0)

  const txt = `*🏓⃝⃘̉̉̉━⋆─❂*
*┃* `𝗣𝗢𝗡𝗚`
*┗━━━━━━━━━━❂*

*┏━ ⌬ 𝗟𝗜𝗩𝗘 ━━━━*
*┃  Speed  ›  ${speed} ms*
*┃  Uptime  ›  ${uptime}*
*┃  Memory  ›  ${mem} MB*
*┗━━━━━━━━━━━━━❥❥❥*

${settings.footer}`

  await sock.sendMessage(chat, { text: txt }, { quoted: m })
}
}