module.exports = {
  name: "antidelete",
  async execute(sock, m, args, settings) {
    const mode = args[0]?.toLowerCase()
    if (!mode) {
      return sock.sendMessage(m.chat, {
        text: `*🗑️ Anti-Delete:* ${global.antiDelete ? "ON ✅" : "OFF ❌"}\n\nUse:\n?antidelete on\n?antidelete off\n\n${settings.footer}`
      }, { quoted: m })
    }
    if (mode === "on") {
      global.antiDelete = true
      return sock.sendMessage(m.chat, { text: `✅ Anti-Delete enabled\n\n${settings.footer}` }, { quoted: m })
    }
    if (mode === "off") {
      global.antiDelete = false
      return sock.sendMessage(m.chat, { text: `❌ Anti-Delete disabled\n\n${settings.footer}` }, { quoted: m })
    }
    return sock.sendMessage(m.chat, { text: `❌ Use ?antidelete on/off\n\n${settings.footer}` }, { quoted: m })
  }
}
