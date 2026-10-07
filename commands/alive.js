const moment = require('moment-timezone')
module.exports = {
name: "alive",
alias: ["bot","status"],
async execute(sock, m, args, settings) {
try { await sock.sendMessage(m.chat, { react: { text: "🌎", key: m.key } }) } catch{}
let pushName = m.pushName || "User"
let fancy = pushName.toUpperCase()
let uptime = clockString(process.uptime()*1000)
let date = moment().tz("Africa/Lagos").format("DD/MM/YYYY")
let time = moment().tz("Africa/Lagos").format("HH:mm:ss")

let txt = `
*🌎⃝⃘̉̉̉━⋆─⋆──❂*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☠︎︎*
*✧ ${fancy}𓂃✍︎𝄞*
*╰────────────────❂*
 *┏━━━━━━━━━━━❥❥❥*
 *┃* \`𝗔𝗟𝗜𝗩𝗘\`
 *┗━━━━━━━━━━━❥❥❥*

*┏━ ⌬ 𝗕𝗢𝗧 𝗜𝗡𝗙𝗢 ━━━━*
*┃* 🌍 Mode › ${global.privacyMode || "Public"}
*┃* ⏳ Uptime › ${uptime}
*┃* 📅 Date › ${date}
*┃* ⏰ Time › ${time}
*┗━━━━━━━━━━━━━❥❥❥*

*✅ Bot is Online & Working!*

${settings.footer}
`
await sock.sendMessage(m.chat, { text: txt }, { quoted: m })
}
}
function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2,0)).join(':')
}
