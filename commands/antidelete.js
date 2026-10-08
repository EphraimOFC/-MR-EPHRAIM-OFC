module.exports = {
  name: "antidelete",
  async execute(sock, m, args, settings) {
    const mode = args[0]?.toLowerCase();

    if (!mode) {
      return sock.sendMessage(m.chat, {
        text: `┏━━━━━━━━━━━━━━━━━
┃ 🗑️ *MESSAGE DELETED*
┗━━━━━━━━━━━━━━━━━
*Status :-* ${global.antiDelete ? "ON ✅" : "OFF ❌"}

Use:
?antidelete on
?antidelete off

${settings.footer}`
      }, { quoted: m });
    }

    if (mode === "on") {
      global.antiDelete = true;
      return sock.sendMessage(m.chat, {
        text: `┏━━━━━━━━━━━━━━━━━
┃ 🗑️ *MESSAGE DELETED*
┗━━━━━━━━━━━━━━━━━
*Status :-* ON ✅

${settings.footer}`
      }, { quoted: m });
    }

    if (mode === "off") {
      global.antiDelete = false;
      return sock.sendMessage(m.chat, {
        text: `┏━━━━━━━━━━━━━━━━━
┃ 🗑️ *MESSAGE DELETED*
┗━━━━━━━━━━━━━━━━━
*Status :-* OFF ❌

${settings.footer}`
      }, { quoted: m });
    }

    return sock.sendMessage(m.chat, {
      text: `❌ Use ?antidelete on/off

${settings.footer}`
    }, { quoted: m });
  }
};