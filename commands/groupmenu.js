module.exports = {
name: "groupmenu",
execute: async (sock, m, args, settings) => {
const text = `
╭───◐ *GROUP MENU - E TECH OFC* 👥
╰───◐
╭───◐
│ 👥 .tagall - Tag All
│ 👁️ .hidetag - Hide Tag
│ 👢 .kick @user - Kick
│ ➕ .add 234xxx - Add
│ 👑 .promote @user - Promote
│ 🔻 .demote @user - Demote
│ 🔓 .open - Open Group
│ 🔒 .close - Close Group
│ 🔗 .link - Group Link
│ 🔄 .revoke - Revoke Link
│ 📝 .setname - Set Name
│ 📄 .setdesc - Set Desc
│ 🚫 .antilink on/off
│ 🤖 .antibot on/off
╰───◐
╭───◐ *PROTECTION* 🛡️
│ 🔒 2347072956206 - Main Protected
│ 🔒 2348108717744 - Backup Protected
│ ✅ Cannot be kicked/banned
╰───◐
╭───◐
│ 👑 MR EPHRAIM OFC
│ 🤖 E TECH OFC V2.0
╰───◐

${settings.footer}`;
await sock.sendMessage(m.key.remoteJid, { image: { url: settings.menuImage }, caption: text }, { quoted: m });
}
}
