module.exports = {
name: "toolsmenu",
async execute(sock, m) {
let f = (m.pushName||"User").toUpperCase()
let txt = `
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
*┃* \`.ping\` \`.alive\` \`.system\` \`.url\`
*┃* \`.hide\` \`.unhide\` \`.fetch\`
*┃* \`.sticker\` \`.toimg\`
*┗━━━━━━❥❥❥*

👨‍💻 Develop By *ᴍʀ ᴇᴘʜʀᴀɪᴍ ᴏꜰᴄ*
> *© Powered by E TECH OFC™*
`
await sock.sendMessage(m.chat, { text: txt }, { quoted: m })
}
}
