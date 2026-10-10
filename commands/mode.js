module.exports = {
  name: "mode",
  alias: ["modes"],
  async execute(sock, m, args, settings) {
    const chat = m.chat;
    const mode = args[0]? args[0].toLowerCase() : "";

    if (!mode) {
      const current = global.privacyMode || "public";
      return sock.sendMessage(chat, {
        text: `*🔧⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`𝗕𝗢𝗧 𝗠𝗢𝗗𝗘\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* Current: \`${current.toUpperCase()}\`\n*┃*\n*┏━「 𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘 」*\n*┃* 🌍 \`.mode public\` - Everywhere\n*┃* 🔒 \`.mode private\` - Owner only\n*┃* 📥 \`.mode inbox\` - DM only\n*┃* 👥 \`.mode group\` - Groups only\n*┗━━━━━━━━━━❥❥❥*\n\n*┃* Use: \`?mode public\` / \`private\` / \`inbox\` / \`group\`\n*┃*\n*┗━「 ${settings.footer} 」*`
      }, { quoted: m });
    }

    if (!["public","private","inbox","group","self","dm"].includes(mode)) {
      return sock.sendMessage(chat, { text: `*❌⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`INVALID MODE\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* Use: public / private / inbox / group\n*┃*\n*┗━「 ${settings.footer} 」*` }, { quoted: m });
    }

    let finalMode = mode;
    if (mode === "self" || mode === "dm") finalMode = "inbox";

    global.privacyMode = finalMode;

    try {
      const fs = require('fs');
      let data = {};
      if (fs.existsSync('./database/mode.json')) data = JSON.parse(fs.readFileSync('./database/mode.json'));
      data.mode = finalMode;
      if (!fs.existsSync('./database')) fs.mkdirSync('./database');
      fs.writeFileSync('./database/mode.json', JSON.stringify(data, null, 2));
    } catch {}

    const designs = {
      public: `*🌍⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`𝗣𝗨𝗕𝗟𝗜𝗖 𝗠𝗢𝗗𝗘\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* ✅ Everywhere enabled\n*┃* 👥 Groups + Inbox\n*┃*\n*┗━「 ${settings.footer} 」*`,
      private: `*🔒⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`𝗣𝗥𝗜𝗩𝗔𝗧𝗘 𝗠𝗢𝗗𝗘\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* 🔒 Owner only\n*┃*\n*┗━「 ${settings.footer} 」*`,
      inbox: `*📥⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`𝗜𝗡𝗕𝗢𝗫 𝗠𝗢𝗗𝗘\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* 📥 DM only\n*┃* 🚫 Groups ignored\n*┃*\n*┗━「 ${settings.footer} 」*`,
      group: `*👥⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`𝗚𝗥𝗢𝗨𝗣 𝗠𝗢𝗗𝗘\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* 👥 Groups only\n*┃* 🚫 Inbox ignored\n*┃*\n*┗━「 ${settings.footer} 」*`
    };

    await sock.sendMessage(chat, { react: { text: finalMode === "private"? "🔒" : finalMode === "inbox"? "📥" : finalMode === "group"? "👥" : "🌍", key: m.key } });
    return sock.sendMessage(chat, { text: designs[finalMode] }, { quoted: m });
  }
};
