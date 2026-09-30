module.exports = {
  name: "antiviewonce",
  execute: async (sock, m, args, settings) => {
    if(!global.antiviewonce) global.antiviewonce = true;
    const text = args[0]?.toLowerCase();
    if (text === "on") {
      global.antiviewonce = true;
      await sock.sendMessage(m.chat, { text: "✅ *Anti-ViewOnce ON*\nBot go open Photo, Video, Voice Note - ALL ViewOnce" }, { quoted: m });
    } else if (text === "off") {
      global.antiviewonce = false;
      await sock.sendMessage(m.chat, { text: "❌ *Anti-ViewOnce OFF*" }, { quoted: m });
    } else {
      await sock.sendMessage(m.chat, { text: `*Anti-ViewOnce:* ${global.antiviewonce? "ON ✅" : "OFF ❌"}\n\nUse:\n.antiviewonce on\n.antiviewonce off\n\n> ${settings.footer}` }, { quoted: m });
    }
  }
};
