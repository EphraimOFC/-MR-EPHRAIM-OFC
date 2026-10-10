module.exports = {
  name: "antidelete",
  async execute(sock, m, args, settings) {
    const mode = args[0]? args[0].toLowerCase() : "";
    if (!mode) {
      return await sock.sendMessage(m.chat, { text: `*🗑️⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`ANTI DELETE\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* Status: ${global.antiDelete? "ON ✅" : "OFF ❌"}\n*┃*\n*┏━「 USAGE 」*\n*┃*?antidelete on\n*┃*?antidelete off\n*┗━━━━━━━━━━❥❥❥*\n*┗━「 ${settings.footer} 」*` }, { quoted: m });
    }
    if (mode === "on") {
      global.antiDelete = true;
      return await sock.sendMessage(m.chat, { text: `*🗑️⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`ANTI DELETE\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* Status: ON ✅\n*┗━「 ${settings.footer} 」*` }, { quoted: m });
    }
    if (mode === "off") {
      global.antiDelete = false;
      return await sock.sendMessage(m.chat, { text: `*🗑️⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`ANTI DELETE\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* Status: OFF ❌\n*┗━「 ${settings.footer} 」*` }, { quoted: m });
    }
  }
};