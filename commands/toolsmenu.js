module.exports = {
name: "toolsmenu",
alias: ["toolmenu"],
async execute(sock, m) {
  const f = (m.pushName || "User").toUpperCase();
  const txt = `*🛠️ TOOLS MENU*

*Hello ${f}*

• `.ping` - bot speed
• `.alive` - check alive
• `.system` - system info
• `.url` - url to image
• `.fetch` - fetch url
• `.hide` - hide command
• `.unhide` - unhide command
• `.sticker` - image to sticker
• `.toimg` - sticker to image
• `.remini` - enhance image
`;
  await sock.sendMessage(m.chat || m.key?.remoteJid, { text: txt });
}
};
