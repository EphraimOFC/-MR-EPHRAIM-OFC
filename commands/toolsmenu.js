module.exports = {
  name: "toolsmenu",
  alias: ["toolmenu"],
  async execute(sock, m) {
    const f = (m.pushName || "User").toUpperCase();
    const txt = `
*🛠️⃝⃘̉̉̉━⋆─⋆──❂*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☠︎︎*
*✧ ${f}𓂃✍︎𝄞*
*╰────────────────❂*
 *┏━━━━━━━━━━━❥❥❥*
 *┃* \`𝗧𝗢𝗢𝗟𝗦 𝗠𝗘𝗡𝗨\`
 *┗━━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* \`.ping\` - bot speed
*┃* \`.alive\` - check alive
*┃* \`.system\` - system info
*┃* \`.url\` - media to URL
*┃* \`.fetch\` - fetch URL
*┃* \`.hide\` - hide text
*┃* \`.unhide\` - reveal text
*┃* \`.sticker\` - image/video to sticker
*┃* \`.toimg\` - sticker to image
*┃* \`.remini\` - enhance image
*┃* \`.bot\` - create paired bot
*┃* \`.send\` - save/send status
*┗━━━━━━❥❥❥*

👨‍💻 Develop By *ᴍʀ ᴇᴘʜʀᴀɪᴍ ᴏꜰᴄ*
> *© Powered by E TECH OFC™*
`;
    await sock.sendMessage(m.chat, { text: txt }, { quoted: m });
  }
};
