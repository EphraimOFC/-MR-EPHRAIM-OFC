const fs = require('fs')
module.exports = {
  name: "top",
  alias: ["leaderboard","rank"],
  async execute(sock, m, args, settings) {
    let chat = m.chat
    if(!chat.endsWith("@g.us")) return sock.sendMessage(chat, { text: `*❌⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* Group only\n*┗━「 ${settings.footer} 」*` })

    try{ await sock.sendMessage(chat, { react: { text: "🏆", key: m.key } }) }catch{}

    let path = './database/activity.json'
    if(!fs.existsSync(path)){
      return sock.sendMessage(chat, { text: `*🏆⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`TOP ACTIVE\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* ℹ️ Activity tracking is OFF\n*┃* Admin use:?activity on\n*┃*\n*┗━「 ${settings.footer} 」*` })
    }

    let db = JSON.parse(fs.readFileSync(path))
    if(!db[chat] ||!db[chat].enabled){
      return sock.sendMessage(chat, { text: `*🏆⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`TOP ACTIVE\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* ℹ️ Activity tracking is OFF\n*┃* Admin use:?activity on\n*┃*\n*┗━「 ${settings.footer} 」*` })
    }

    let users = db[chat].users
    let sorted = Object.entries(users).sort((a,b) => b[1]-a[1]).slice(0, 10)

    if(sorted.length === 0){
      return sock.sendMessage(chat, { text: `*🏆⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`TOP ACTIVE\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* No activity yet.\n*┃*\n*┗━「 ${settings.footer} 」*` })
    }

    let metadata = await sock.groupMetadata(chat)
    let groupName = metadata.subject
    let player = m.pushName || "User"

    let list = sorted.map((v,i) => {
      let num = v[0].split('@')[0]
      let medal = i===0? "🥇" : i===1? "🥈" : i===2? "🥉" : `*${i+1}.*`
      return `${medal} @${num} - ${v[1]} msgs`
    }).join('\n')

    let mentions = sorted.map(v => v[0])

    let txt = `*🏆⃝⃘̉̉̉━⋆─⋆──❂*
*┃* \`TOP ACTIVE MEMBERS\`
*┗━━━━━━━━━━━━━❂*

*┏━「 GROUP 」*
*┃* ✨ ${groupName}
*┃* 👤 Requested by: ${player}
*┗━━━━━━━━━━❥❥❥*

*┏━「 LEADERBOARD 」*
${list.split('\n').map(l => `*┃* ${l}`).join('\n')}
*┗━━━━━━━━━━❥❥❥*

*┗━「 ${settings.footer} 」*`

    await sock.sendMessage(chat, { text: txt, mentions: mentions })
    try{ await sock.sendMessage(chat, { react: { text: "✅", key: m.key } }) }catch{}
  }
}