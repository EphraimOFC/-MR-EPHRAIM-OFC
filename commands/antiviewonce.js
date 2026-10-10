module.exports = {
  name: "antiviewonce",
  async execute(sock, m, args, settings) {
    if (typeof global.antiviewonce!== "boolean") {
      global.antiviewonce = true;
    }
    const userName = m.pushName || "User";
    const mode = args[0]? args[0].toLowerCase() : "";
    if (mode === "on") {
      global.antiviewonce = true;
      return await sock.sendMessage(m.chat, { text: `*👁️⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`ANTI VIEWONCE\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* Status: ON ✅\n*┃* User: ${userName}\n\n👨‍💻 Develop By *ᴍʀ ᴇᴘʜʀᴀɪᴍ ᴏꜰᴄ*\n> *© Powered by E TECH OFC™*` }, { quoted: m });
    }
    if (mode === "off") {
      global.antiviewonce = false;
      return await sock.sendMessage(m.chat, { text: `*👁️⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`ANTI VIEWONCE\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* Status: OFF ❌\n*┃* User: ${userName}\n\n👨‍💻 Develop By *ᴍʀ ᴇᴘʜʀᴀɪᴍ ᴏꜰᴄ*\n> *© Powered by E TECH OFC™*` }, { quoted: m });
    }
    return await sock.sendMessage(m.chat, { text: `*👁️⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`ANTI VIEWONCE\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* Status: ${global.antiviewonce? "ON ✅" : "OFF ❌"}\n*┃* User: ${userName}\n\n👨‍💻 Develop By *ᴍʀ ᴇᴘʜʀᴀɪᴍ ᴏꜰᴄ*\n> *© Powered by E TECH OFC™*` }, { quoted: m });
  }
};