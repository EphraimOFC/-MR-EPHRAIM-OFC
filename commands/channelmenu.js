module.exports = {
name: "channelmenu",
alias: ["cmenu"],
async execute(sock, m) {
let f = (m.pushName||"User").toUpperCase()
let txt = `
*📢⃝⃘̉̉̉━⋆─⋆──❂*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☠︎︎*
*✧ ${f}𓂃✍︎𝄞*
*╰────────────────❂*
 *┏━━━━━━━━━━━❥❥❥*
 *┃* \`𝗖𝗛𝗔𝗡𝗡𝗘𝗟 𝗠𝗘𝗡𝗨\`
 *┗━━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* \`.mychannels\` - list channels
*┃* \`.setchannel\` - set channel
*┃* \`.delchannel\` - delete channel
*┃* \`.creact\` - channel react
*┃* \`.boost\` - boost channel
*┗━━━━━━❥❥❥*

👨‍💻 Develop By *ᴍʀ ᴇᴘʜʀᴀɪᴍ ᴏꜰᴄ*
> *© Powered by E TECH OFC™*
`
await sock.sendMessage(m.chat, { text: txt }, { quoted: m })
}
}
