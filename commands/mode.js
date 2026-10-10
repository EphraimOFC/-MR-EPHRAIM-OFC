module.exports = {
  name: "mode",
  alias: ["modes"],
  async execute(sock, m, args, settings) {
    const chat = m.chat;
    const mode = args[0]? args[0].toLowerCase() : "";

    // Show current
    if (!mode) {
      const current = global.privacyMode || "public";
      const icon = current === "private"? "🔒" : current === "inbox"? "📥" : "🌍";
      return sock.sendMessage(chat, {
        text: `*🔧⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`𝗕𝗢𝗧 𝗠𝗢𝗗𝗘\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* Current: \`${current.toUpperCase()}\` ${icon}\n*┃*\n*┏━「 𝗔𝗩𝗔𝗜𝗟𝗔𝗕𝗟𝗘 」*\n*┃* 🌍 \`.mode public\` - Works everywhere\n*┃* 🔒 \`.mode private\` - Owner only\n*┃* 📥 \`.mode inbox\` - DM only\n*┗━━━━━━━━━━❥❥❥*\n\n*┃* Use: \`?mode private\` / \`?mode public\` / \`?mode inbox\`\n*┃*\n*┗━「 ${settings.footer} 」*`
      }, { quoted: m });
    }

    if (!["public","private","inbox","self","dm"].includes(mode)) {
      return sock.sendMessage(chat, { text: `*❌⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`INVALID MODE\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* Use: public / private / inbox\n*┃*\n*┗━「 ${settings.footer} 」*` }, { quoted: m });
    }

    let finalMode = mode;
    if (mode === "self" || mode === "dm") finalMode = "inbox";

    global.privacyMode = finalMode;

    // Save to file so it survives restart
    try {
      const fs = require('fs');
      let data = {};
      if (fs.existsSync('./database/mode.json')) data = JSON.parse(fs.readFileSync('./database/mode.json'));
      data.mode = finalMode;
      if (!fs.existsSync('./database')) fs.mkdirSync('./database');
      fs.writeFileSync('./database/mode.json', JSON.stringify(data, null, 2));
    } catch {}

    const designs = {
      public: `*🌍⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`𝗣𝗨𝗕𝗟𝗜𝗖 𝗠𝗢𝗗𝗘\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* ✅ Bot now works EVERYWHERE\n*┃* 👥 Groups + Inbox + All users\n*┃*\n*┗━「 ${settings.footer} 」*`,
      private: `*🔒⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`𝗣𝗥𝗜𝗩𝗔𝗧𝗘 𝗠𝗢𝗗𝗘\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* 🔒 Bot now OWNER ONLY\n*┃* 👤 Only you can use bot\n*┃* 🚫 Others will be ignored\n*┃*\n*┗━「 ${settings.footer} 」*`,
      inbox: `*📥⃝⃘̉̉̉━⋆─⋆──❂*\n*┃* \`𝗜𝗡𝗕𝗢𝗫 𝗠𝗢𝗗𝗘\`\n*┗━━━━━━━━━━━━━❂*\n\n*┃* 📥 Bot now INBOX ONLY\n*┃* 💬 Works only in DM/Private\n*┃* 🚫 Ignores all groups\n*┃*\n*┗━「 ${settings.footer} 」*`
    };

    await sock.sendMessage(chat, { react: { text: finalMode === "private"? "🔒" : finalMode === "inbox"? "📥" : "🌍", key: m.key } });
    return sock.sendMessage(chat, { text: designs[finalMode] }, { quoted: m });
  }
};
