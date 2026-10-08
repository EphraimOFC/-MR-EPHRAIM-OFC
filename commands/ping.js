module.exports = {
name: "ping",
async execute(sock, m, args, settings) {
  let chat = m.chat
  let start = Date.now()

  // 🏓 REACT IMMEDIATELY ON .ping MESSAGE
  try { 
    await sock.sendMessage(chat, { react: { text: "🏓", key: m.key } }) 
  } catch {}

  let speed = Date.now() - start
  let upSec = process.uptime()
  let mins = Math.floor(upSec / 60)
  let hrs = Math.floor(mins / 60)
  let uptime = hrs > 0 ? `${hrs}h ${mins % 60}m` : `${mins}m`
  let mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0)

  let txt = `> PONG

┌─⬢ LIVE ──
  Speed › ${speed} ms
  Uptime › ${uptime}
  Memory › ${mem} MB
└───────────◍

${settings.footer}`

  await sock.sendMessage(chat, { text: txt }, { quoted: m })
}
}
