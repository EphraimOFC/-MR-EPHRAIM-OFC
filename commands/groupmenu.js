module.exports = {
name: "groupmenu",
alias: ["gmenu"],
async execute(sock, m) {
let f = (m.pushName||"User").toUpperCase()
let txt = `
*👥⃝⃘̉̉̉━⋆─⋆──❂*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☠︎︎*
*✧ ${f}𓂃✍︎𝄞*
*╰────────────────❂*
 *┏━━━━━━━━━━━❥❥❥*
 *┃* \`𝗚𝗥𝗢𝗨𝗣 𝗠𝗘𝗡𝗨\`
 *┗━━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* \`.add\` - add member
*┃* \`.kick\` - kick member
*┃* \`.promote\` - make admin
*┃* \`.demote\` - remove admin
*┃* \`.tagall\` - tag all members
*┃* \`.hidetag\` - hide tag
*┃* \`.open\` - open group
*┃* \`.close\` - close group
*┃* \`.link\` - group link
*┃* \`.antilink\` - antilink on/off
*┗━━━━━━❥❥❥*

👨‍💻 Develop By *ᴍʀ ᴇᴘʜʀᴀɪᴍ ᴏꜰᴄ*
> *© Powered by E TECH OFC™*
`
await sock.sendMessage(m.chat, { text: txt }, { quoted: m })
}
}
