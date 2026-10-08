module.exports = {
  name: "antiviewonce",
  execute: async (sock, m, args, settings) => {
    if (typeof global.antiviewonce !== "boolean") global.antiviewonce = true;
    const mode = args[0]?.toLowerCase();

    if (mode === "on") {
      global.antiviewonce = true;
      return sock.sendMessage(m.chat, {
        text: `┏━━━━━━━━━━━━━━
┃ 👁️ *ANTI VIEW ONE*
┗━━━━━━━━━━━━━━
*Status :-* ON ✅

*Note :-* _Reply to a View Once image, video or voice note with anything and I will restore it here._
━━━━━━━━━━━━━━━━━━━━
${settings.footer}`
      }, { quoted: m });
    }

    if (mode === "off") {
      global.antiviewonce = false;
      return sock.sendMessage(m.chat, {
        text: `┏━━━━━━━━━━━━━━
┃ 👁️ *ANTI VIEW ONE*
┗━━━━━━━━━━━━━━
*Status :-* OFF ❌

${settings.footer}`
      }, { quoted: m });
    }

    return sock.sendMessage(m.chat, {
      text: `┏━━━━━━━━━━━━━━
┃ 👁️ *ANTI VIEW ONE*
┗━━━━━━━━━━━━━━
*Status :-* ${global.antiviewonce ? "ON ✅" : "OFF ❌"}

*Note :-* _Reply to a View Once image, video or voice note with anything and I will restore it here._
━━━━━━━━━━━━━━━━━━━━
${settings.footer}`
    }, { quoted: m });
  }
};