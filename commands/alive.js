const fs = require('fs')
const path = require('path')

global.aliveReply = global.aliveReply || {}

module.exports = {
name: "alive",
alias: ["bot","live"],
async execute(sock, m, args, settings) {
  let chat = m.chat
  let pushName = m.pushName || "User"
  let start = Date.now()

  try { await sock.sendMessage(chat, { react: { text: "💚", key: m.key } }) } catch{}
  let speed = Date.now() - start
  let upSec = process.uptime()
  let mins = Math.floor(upSec / 60)
  let hrs = Math.floor(mins / 60)
  let days = Math.floor(hrs / 24)
  let uptime = days>0? `${days}d ${hrs%24}h ${mins%60}m` : hrs>0? `${hrs}h ${mins%60}m` : `${mins}m`
  let mem = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(0)
  let totalCmds = fs.readdirSync(__dirname).filter(f=>f.endsWith('.js')).length
  let mode = settings.public!== false? "🌍 Public" : "🔒 Private"

  // SAVE CHAT FOR REPLY NUMBERS - EXPIRES IN 2 MINS
  global.aliveReply[chat] = true
  setTimeout(()=>{ delete global.aliveReply[chat] }, 120000)

  let txt = `*💚⃝⃘̉̉̉━⋆─⋆──❂*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☠︎︎*
*✧ ${pushName}𓂃✍︎𝄞*
*╰────────────────❂*
 *┏━━━━━━❥❥❥*
 *┃* \`𝗔𝗟𝗜𝗩𝗘\`
 *┗━━━━━━❥❥❥*

*Hey ${pushName}, E TECH OFC is online and ready!*

*┏━ ⌬ 𝗟𝗜𝗩𝗘 𝗦𝗧𝗔𝗧𝗨𝗦 ━━━━*
*┃ Speed › ${speed} ms*
*┃ Uptime › ${uptime}*
*┃ Memory › ${mem} MB*
*┃ Mode › ${mode}*
*┃ Prefix › [ ${settings.prefix} ]*
*┃ Commands › ${totalCmds}*
*┃ Version › 1.0 E TECH*
*┗━━━━━━━━━━━━━❥❥❥*
*┏━「 𝚁𝚎𝙿𝙻𝚈 𝙽𝚄𝙼𝙱𝚎𝚁 ⤵️ 」*
*┃* 1️⃣ \`Main menu\`
*┃* 2️⃣ \`Speed test\`
*┃* 3️⃣ \`Settings (owner)\`
*┃* 4️⃣ \`Bot info\`
*┗━━━━━━━━━━❥❥❥*

${settings.footer}`

  await sock.sendMessage(chat, { text: txt }, { quoted: m })
}
}
