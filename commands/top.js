const fs = require('fs')
module.exports = {
  name: "top",
  async execute(sock, m, args, settings) {
    let chat = m.chat
    if(!chat.endsWith("@g.us")) return sock.sendMessage(chat, { text: "Group only" })

    let path = './database/activity.json'
    if(!fs.existsSync(path)) return sock.sendMessage(chat, { text: `*MONEY HEIST*\n\nℹ️ Activity tracking is OFF in this group.\nAn admin can start it:?activity on\n\n*<\> ${settings.footer}*` })

    let db = JSON.parse(fs.readFileSync(path))
    if(!db[chat] ||!db[chat].enabled){
      return sock.sendMessage(chat, { text: `*MONEY HEIST*\n\nℹ️ Activity tracking is OFF in this group.\nAn admin can start it:?activity on\n\n*<\> ${settings.footer}*` })
    }

    let users = db[chat].users
    let sorted = Object.entries(users).sort((a,b) => b[1]-a[1]).slice(0, 10)

    if(sorted.length === 0){
      return sock.sendMessage(chat, { text: `*MONEY HEIST*\n\nNo activity yet.\n\n*<\> ${settings.footer}*` })
    }

    let metadata = await sock.groupMetadata(chat)
    let groupName = metadata.subject
    let player = m.pushName || "User"

    let list = sorted.map((v,i) => {
      let num = v[0].split('@')[0]
      return `*${i+1}.* @${num} - ${v[1]} msgs`
    }).join('\n')

    let mentions = sorted.map(v => v[0])

    let txt = `*🛡️⃝⃘̉̉̉━⋆─⋆──❂*
*✧ ${player.toUpperCase()}𓂃✍︎𝄞*
*╰────────────────❂*
*┃* \`TOP ACTIVE MEMBERS\`
*┗━━━━━━━━━━━❥❥❥*

*✨ Group :-* ${groupName}

${list}

*<\> ${settings.footer}*`

    await sock.sendMessage(chat, { text: txt, mentions: mentions })
  }
}
