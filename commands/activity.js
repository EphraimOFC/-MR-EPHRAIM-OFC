const fs = require('fs')
module.exports = {
  name: "activity",
  async execute(sock, m, args, settings) {
    let chat = m.chat
    if(!chat.endsWith("@g.us")) return sock.sendMessage(chat, { text: "Group only" })

    let path = './database/activity.json'
    if(!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}))
    let db = JSON.parse(fs.readFileSync(path))
    if(!db[chat]) db[chat] = { enabled: false, users: {} }

    let option = args[0]?.toLowerCase()
    if(!option) return sock.sendMessage(chat, { text: `Use:?activity on /?activity off\nCurrent: ${db[chat].enabled? "ON" : "OFF"}` })

    if(option === "on"){
      db[chat].enabled = true
      fs.writeFileSync(path, JSON.stringify(db, null, 2))
      return sock.sendMessage(chat, { text: `*MONEY HEIST*\n\n✅ Activity tracking is now ON in this group.\n\n*<\> ${settings.footer}*` })
    }
    if(option === "off"){
      db[chat].enabled = false
      fs.writeFileSync(path, JSON.stringify(db, null, 2))
      return sock.sendMessage(chat, { text: `*MONEY HEIST*\n\n❌ Activity tracking is now OFF.\n\n*<\> ${settings.footer}*` })
    }
  }
}
