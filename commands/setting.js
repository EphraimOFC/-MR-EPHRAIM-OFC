const fs = require('fs')
module.exports = {
name: "settings",
alias: ["setting"],
async execute(sock, m, args, settings) {
let chat = m.chat
let sender = m.key.participant || m.key.remoteJid
let isOwner = sender && (sender.includes("2347072956206") || sender.includes("2348108717744") || sender.includes(settings.ownerNumber)) || global.sudo?.includes(sender)
let body = m.message.conversation || m.message.extendedTextMessage?.text || ""
let usedPrefix = body.startsWith("?")? "?" : "."

let fancy = (m.pushName||"User").toUpperCase()
let mode = global.privacyMode || "public"

// If someone uses.setting -> show simple version
if (usedPrefix === "." ) {
  let txt = `
*⚙️⃝⃘̉̉̉━⋆─⋆──❂*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☠︎︎*
*✧ ${fancy}𓂃✍︎𝄞*
*╰────────────────❂*
 *┏━━━━━━━━━━━❥❥❥*
 *┃* \`𝗦𝗘𝗧𝗧𝗜𝗡𝗚𝗦\`
 *┗━━━━━━━━━━━❥❥❥*

*┏━ ⌬ 𝗜𝗡𝗙𝗢 ━━━━*
*┃* 🌍 Mode › ${mode}
*┃* 🤖 Bot › E TECH OFC™
*┃* 👑 Owner › ᴍʀ ᴇᴘʜʀᴀɪᴍ ᴏꜰᴄ
*┗━━━━━━━━━━━━━❥❥❥*

*For full control owner uses:?setting*

👨‍💻 Develop By *ᴍʀ ᴇᴘʜʀᴀɪᴍ ᴏꜰᴄ*
> *© Powered by E TECH OFC™*
`
  return sock.sendMessage(chat, { text: txt }, { quoted: m })
}

// If YOU use?setting -> full control
if (usedPrefix === "?" && isOwner) {
  if (args[0]) {
    let opt = args[0].toLowerCase()
    let val = args[1]?.toLowerCase()
    if (opt === "mode" && ["public","private","self"].includes(val)) {
      global.privacyMode = val
      fs.writeFileSync('./mode.json', JSON.stringify({ mode: val }))
      return sock.sendMessage(chat, { text: `✅ Mode changed to *${val.toUpperCase()}*` }, { quoted: m })
    }
    if (opt === "anticall") {
      global.anticall = val === "on"
      return sock.sendMessage(chat, { text: `✅ Anticall ${global.anticall? "ON ✅" : "OFF ❌"}` }, { quoted: m })
    }
  }

  let txt2 = `
*⚙️⃝⃘̉̉̉━⋆─⋆──❂*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☠︎︎*
*✧ ${fancy}𓂃✍︎𝄞*
*╰────────────────❂*
 *┏━━━━━━━━━━━❥❥❥*
 *┃* \`𝗢𝗪𝗡𝗘𝗥 𝗦𝗘𝗧𝗧𝗜𝗡𝗚𝗦\`
 *┗━━━━━━━━━━━❥❥❥*

*┏━ ⌬ 𝗖𝗨𝗥𝗘𝗡𝗧 ━━━━*
*┃* 🌍 Mode › ${mode}
*┃* 📞 Anticall › ${global.anticall? "ON ✅" : "OFF ❌"}
*┃* 👁️ Antiview › ${global.antiviewonce? "ON ✅" : "OFF ❌"}
*┗━━━━━━━━━━━━━❥❥❥*

*┏━「? COMMANDS 」*
*┃*?setting mode public
*┃*?setting mode private
*┃*?mode public/private
*┃*?ban /?unban
*┃*?restart
*┗━━━━━━━━━━❥❥❥*

👨‍💻 Develop By *ᴍʀ ᴇᴘʜʀᴀɪᴍ ᴏꜰᴄ*
> *© Powered by E TECH OFC™*
`
  return sock.sendMessage(chat, { text: txt2 }, { quoted: m })
}
}
}
