module.exports = {
  name: "privacy",
  execute: async (sock, m, args, settings) => {
    const sender = String(m.key.participant || m.key.remoteJid || "");
    const owners = (settings.protectedNumbers || settings.ownerNumbers || []).map(String);
    if(!owners.some(n => sender.includes(n))){
      return sock.sendMessage(m.chat,{text:"❌ *OWNER ONLY*\n\nPrivacy mode can only be changed by the protected owner."},{quoted:m});
    }

    const current = global.privacyMode || "public";
    const text = `╭─〔 🔐 PRIVACY SETTINGS 〕─╮
│ Current: *${current.toUpperCase()}*
│
│ .privacy public  → everyone
│ .privacy private → owner/sudo
│ .privacy group   → groups only
│ .privacy pc      → private chats
╰────────────────────╯`;

    if(!args[0]) return sock.sendMessage(m.chat,{text},{quoted:m});
    const mode=String(args[0]).toLowerCase();
    if(!["public","private","group","pc"].includes(mode)){
      return sock.sendMessage(m.chat,{text:"❌ Invalid mode. Use public, private, group or pc."},{quoted:m});
    }
    global.privacyMode=mode;
    return sock.sendMessage(m.chat,{text:`✅ Privacy mode changed to *${mode.toUpperCase()}*.`},{quoted:m});
  }
};
