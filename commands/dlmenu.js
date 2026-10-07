module.exports = {
name: "dlmenu",
async execute(sock, m) {
let fancy = (m.pushName || "User").toUpperCase()
let txt = `
*📥⃝⃘̉̉̉━⋆─⋆──❂*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☠︎︎*
*✧ ${fancy}𓂃✍︎𝄞*
*╰────────────────❂*
 *┏━━━━━━━━━━━❥❥❥*
 *┃* \`𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗 𝗠𝗘𝗡𝗨\`
 *┗━━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* \`.song\` - yt song
*┃* \`.video\` - yt video
*┃* \`.fb\` - facebook
*┃* \`.tiktok\` - tiktok
*┃* \`.insta\` - instagram
*┃* \`.apk\` - apk download
*┃* \`.img\` - image search
*┗━━━━━━❥❥❥*

👨‍💻 Develop By *ᴍʀ ᴇᴘʜʀᴀɪᴍ ᴏꜰᴄ*
> *© Powered by E TECH OFC™*
`
await sock.sendMessage(m.chat, { text: txt }, { quoted: m })
}
  }
