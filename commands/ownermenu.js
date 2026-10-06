module.exports = {
name: "ownermenu",
execute: async (sock, m, args, settings) => {
  const PROTECTED = (settings.protectedNumbers || settings.ownerNumbers || []).map(String);
  const sender = m.key.participant || m.key.remoteJid;
  const isOwner = PROTECTED.some(num => sender.includes(num));
  
  if(!isOwner){
    return await sock.sendMessage(m.key.remoteJid, { 
      text: `❌ *OWNER ONLY*\n\nOnly E TECH OFC Owner can use this!\n\n👑 Owner: MR EPHRAIM OFC\n📱 Account: Current connected WhatsApp\n\n${settings.footer}` 
    }, { quoted: m });
  }

  const text = `
╭───◐ *OWNER MENU - E TECH OFC* 👑
╰───◐
╭───◐
│ 🔗 .glink - Group Link
│ 🔄 .glinkreset - Reset Link
│ 👑 .setsudo - Add Sudo
│ ❌ .delsudo - Remove Sudo
│ 🔨 .ban - Ban User
│ ✅ .unban - Unban User
│ 📞 .setcall on/off
│ 📞 .delcall
│ ⚙️ .privacy
│ 📊 .setting
╰───◐
╭───◐
│ 👑 *MR EPHRAIM OFC*
│ 📱 *Account: Current connected WhatsApp*
╰───◐

${settings.footer}`;

  try { await sock.sendMessage(m.key.remoteJid, { image: { url: settings.menuImage }, caption: text }, { quoted: m }); } catch (e) { console.log('Menu image failed: '+e.message); await sock.sendMessage(m.chat, { text }, { quoted: m }); }
}
}
