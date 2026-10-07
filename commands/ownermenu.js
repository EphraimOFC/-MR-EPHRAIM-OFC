module.exports = {
name: "ownermenu",
async execute(sock, m) {
let fancy = (m.pushName || "User").toUpperCase()
let txt = `
*👑⃝⃘̉̉̉━⋆─⋆──❂*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☠︎︎*
*✧ ${fancy}𓂃✍︎𝄞*
*╰────────────────❂*
 *┏━━━━━━━━━━━❥❥❥*
 *┃* \`𝗢𝗪𝗡𝗘𝗥 𝗠𝗘𝗡𝗨\`
 *┗━━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* \`.mode\` - change mode
*┃* \`.settings\` - control panel
*┃* \`.setlogo\` - set menu logo
*┃* \`.getdp\` - get profile pic
*┃* \`.setsudo\` / \`.delsudo\`
*┃* \`.forward\` / \`.fwd\`
*┃* \`.privacy\` - privacy list
*┃* \`.setchannel\` / \`.mychannels\`
*┃* \`.creact\` - channel reactions
*┃* \`.addreply\` / \`.delreply\` / \`.replies\`
*┃* \`.ban\` / \`.unban\`
*┗━━━━━━❥❥❥*

👨‍💻 Develop By *ᴍʀ ᴇᴘʜʀᴀɪᴍ ᴏꜰᴄ*
> *© Powered by E TECH OFC™*
`
await sock.sendMessage(m.chat, { text: txt }, { quoted: m })
}
}
