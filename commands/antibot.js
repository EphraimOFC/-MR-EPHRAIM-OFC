global.antibot = global.antibot || {}
global.botWarnings = global.botWarnings || {}

module.exports = {
name: "antibot",
async execute(sock, m, args, settings) {
  let chat = m.chat
  if(!chat.endsWith("@g.us")) return sock.sendMessage(chat, { text: `❌ Group only\n${settings.footer}` }, { quoted: m })
  let mode = args[0]?.toLowerCase()
  if(!mode) {
    let s = global.antibot[chat]? "ON" : "OFF"
    return sock.sendMessage(chat, { text: `*🛡️ Anti Bot:* ${s}\nUsage:?antibot on/off\n${settings.footer}` }, { quoted: m })
  }
  if(mode==="on"){
    global.antibot[chat] = true
    return sock.sendMessage(chat, { text: `*🛡️ Anti Bot Enabled ✅*\n${settings.footer}` }, { quoted: m })
  }
  if(mode==="off"){
    global.antibot[chat] = false
    return sock.sendMessage(chat, { text: `*🛡️ Anti Bot Disabled 🔴*\n${settings.footer}` }, { quoted: m })
  }
}
}
