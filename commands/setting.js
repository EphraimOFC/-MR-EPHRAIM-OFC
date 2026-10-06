module.exports = {
name: "setting",
alias: ["settings","set"],
execute: async (sock, m, args, settings) => {
const cap = `┌─「 *BOT SETTINGS* 」
│ • Bot Name: ${settings.botName || "E TECH OFC"}
│ • Owner: ${settings.ownerName}
│ • Prefix: ${settings.prefix}
│ • Privacy: ${global.privacyMode || "public"}
│ • AntiViewOnce: ${global.antiviewonce ? "ON" : "OFF"}
│ • AntiCall: ${global.anticall ? "ON" : "OFF"}
│ • Auto React: ${global.creact ? "ON" : "OFF"}
│
│ Commands:
│ • .setpp
│ • .antiviewonce on/off
│ • .setcall on/off
└─────────────

${settings.footer}`;
try {
  await sock.sendMessage(m.chat, { text: cap }, { quoted: m });
} catch (error) {
  console.log("Setting command failed: " + error.message);
}
}
}
