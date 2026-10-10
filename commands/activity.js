const fs = require('fs')
module.exports = {
  name: "activity",
  alias: ["act"],
  async execute(sock, m, args, settings) {
    let chat = m.chat
    if(!chat.endsWith("@g.us")) return sock.sendMessage(chat, { text: `*❌⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* Group only\n*┗━「 ${settings.footer} 」*` })

    let path = './database/activity.json'
    if(!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}))
    let db = JSON.parse(fs.readFileSync(path))
    if(!db[chat]) db[chat] = { enabled: false, users: {} }

    let option = args[0]?.toLowerCase()
    if(!option) {
      return sock.sendMessage(chat, {
        text: `*📊⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`ACTIVITY\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* Current: ${db[chat].enabled? "ON ✅" : "OFF ❌"}\n*┃*\n*┏━「 USAGE 」*\n*┃*?activity on\n*┃*?activity off\n*┗━━━━━━━━━━❥❥❥*\n*┗━「 ${settings.footer} 」*`
      })
    }

    if(option === "on"){
      db[chat].enabled = true
      fs.writeFileSync(path, JSON.stringify(db, null, 2))
      return sock.sendMessage(chat, { text: `*📊⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`ACTIVITY\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* ✅ Activity tracking is now ON\n*┃* Tracking messages...\n*┗━「 ${settings.footer} 」*` })
    }
    if(option === "off"){
      db[chat].enabled = false
      fs.writeFileSync(path, JSON.stringify(db, null, 2))
      return sock.sendMessage(chat, { text: `*📊⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`ACTIVITY\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* ❌ Activity tracking is now OFF\n*┗━「 ${settings.footer} 」*` })
    }
  }
}