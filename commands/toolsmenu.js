module.exports = {
name: "toolsmenu",
alias: ["toolmenu"],
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
*┃* \`.ping\` - bot speed
*┃* \`.alive\` - check alive
*┃* \`.system\` - system info
*┃* \`.url\` - url to image
*┃* \`.fetch\` - fetch url
*┃* \`.hide\` - hide command
*┃* \`.unhide\` - unhide command
*┃* \`.sticker\` - image to sticker
*┃* \`.toimg\` - sticker to image
*┃* \`.remini
