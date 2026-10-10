const fs = require('fs')
module.exports = {
  name: "antilink",
  async execute(sock, m, args, settings) {
    let chat = m.chat
    if(!chat.endsWith("@g.us")) return sock.sendMessage(chat, { text: "Group only" })

    let path = './database/antilink.json'
    if(!fs.existsSync('./database')) fs.mkdirSync('./database')
    if(!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}))
    let db = JSON.parse(fs.readFileSync(path))
    if(!db[chat]) db[chat] = { enabled: false, warnCount: {} }

    let opt = args[0]?.toLowerCase()
    if(!opt) return sock.sendMessage(chat, { text: `*ANTILINK*\nCurrent: ${db[chat].enabled? "ON ✅" : "OFF ❌"}\nUse:?antilink on /?antilink off\n\n*<\> ${settings.footer}*` })

    if(opt === "on"){
      db[chat].enabled = true
      fs.writeFileSync(path, JSON.stringify(db, null, 2))
      return sock.sendMessage(chat, { text: `✅ Anti-Link enabled\n\n*<\> ${settings.footer}*` })
    }
    if(opt === "off"){
      db[chat].enabled = false
      fs.writeFileSync(path, JSON.stringify(db, null, 2))
      return sock.sendMessage(chat, { text: `❌ Anti-Link disabled\n\n*<\> ${settings.footer}*` })
    }
  }
}
