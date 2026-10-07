module.exports = {
name: "menu",
alias: ["allmenu","help"],
async execute(sock, m, args, settings) {
let pushName = m.pushName || "User"
let fancy = pushName.toUpperCase()
let totalCmd = 120
let uptime = clockString(process.uptime()*1000)

let txt = `
*🏠⃝⃘̉̉̉━⋆─⋆──❂*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☠︎︎*
*✧ ${fancy}𓂃✍︎𝄞*
*╰────────────────❂*
 *┏━━━━━━━━━━━❥❥❥*
 *┃* \`𝗠𝗔𝗜𝗡 𝗠𝗘𝗡𝗨\`
 *┗━━━━━━━━━━━❥❥❥*

*Hey ${pushName}, welcome!*

*┏━ ⌬ 𝗤𝗨𝗜𝗖𝗞 𝗩𝗜𝗘𝗪 ━━━━*
*┃ Mode › 🌍 ${global.privacyMode || "Public"}*
*┃ Prefix › [ ${settings.prefix || "."} ]*
*┃ Commands › ${totalCmd}*
*┃ Uptime › ${uptime}*
*┗━━━━━━━━━━━━━❥❥❥*

*┏━「 𝚁𝚎𝙿𝙻𝚈 𝙽𝚄𝙼𝙱𝚎𝚁 ⤵️ 」*
*┃* 1️⃣ \`OWNER · 16\`
*┃* 2️⃣ \`DOWNLOAD · 10\`
*┃* 3️⃣ \`AI · 4\`
*┃* 4️⃣ \`GROUP · 8\`
*┃* 5️⃣ \`TOOLS · 7\`
*┃* 6️⃣ \`EDUCATION · 3\`
*┃* 7️⃣ \`CHANNEL · 4\`
*┗━━━━━━━━━━❥❥❥*

👨‍💻 Develop By *ᴍʀ ᴇᴘʜʀᴀɪᴍ ᴏꜰᴄ*
> *© Powered by E TECH OFC™*
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
