module.exports = {
name: "edumenu",
alias: ["educationmenu"],
async execute(sock, m) {
let f = (m.pushName||"User").toUpperCase()
let txt = `
*📚⃝⃘̉̉̉━⋆─⋆──❂*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☠︎︎*
*✧ ${f}𓂃✍︎𝄞*
*╰────────────────❂*
 *┏━━━━━━━━━━━❥❥❥*
 *┃* \`𝗘𝗗𝗨𝗖𝗔𝗧𝗜𝗢𝗡 𝗠𝗘𝗡𝗨\`
 *┗━━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* \`.define\` - define word
*┃* \`.translate\` - translate
*┃* \`.wikipedia\` - wiki search
*┃* \`.calculate\` - calculator
*┗━━━━━━❥❥❥*

👨‍💻 Develop By *ᴍʀ ᴇᴘʜʀᴀɪᴍ ᴏꜰᴄ*
> *© Powered by E TECH OFC™*
`
await sock.sendMessage(m.chat, { text: txt }, { quoted: m })
}
}
