module.exports = {
name: "ownermenu",
execute: async (sock, m, args, settings) => {
  const PROTECTED = ["2347072956206", "2348108717744"];
  const sender = m.key.participant || m.key.remoteJid;
  const isOwner = PROTECTED.some(num => sender.includes(num));
  
  if(!isOwner){
    return await sock.sendMessage(m.key.remoteJid, { 
      text: `❌ *OWNER ONLY*\n\nOnly E TECH OFC Owner can use this!\n\n👑 Owner: MR EPHRAIM OFC\n📞 Main: 2347072956206\n📞 Backup: 2348108717744\n\n${settings.footer}` 
    }, { quoted: m });
  }

  const text = `
╭───◐ *OWNER MENU - E TECH OFC* 👑
╰───◐
╭───◐
│ 🔄 .restart - Restart Bot
│ 📢 .broadcast - Broadcast
│ 🚫 .block - Block User
│ ✅ .unblock - Unblock User
│ 🖼️ .setpp - Set Bot DP
│ 🗑️ .clearsession - Clear Session
│ 👑 .setsudo - Add Sudo
│ ❌ .delsudo - Remove Sudo
│ 🔨 .ban - Ban User
│ ✅ .unban - Unban User
│ 📞 .anticall on/off
│ ⚙️ .privacy
│ 📊 .setting
╰───◐
╭───◐
│ 👑 *MR EPHRAIM OFC*
│ 📞 *2347072956206 (Main)*
│ 📞 *2348108717744 (Backup)*
│ 🔒 *Both Protected*
╰───◐

${settings.footer}`;

  try { await sock.sendMessage(m.key.remoteJid, { image: { url: settings.menuImage }, caption: text }, { quoted: m }); } catch (e) { console.log('Menu image failed: '+e.message); await sock.sendMessage(m.chat, { text }, { quoted: m }); }
}
}
