module.exports = {
  name: "open",
  async execute(sock, m, args, settings) {
    let chat = m.chat
    if(!chat.endsWith("@g.us")) return sock.sendMessage(chat, { text: "Group only" })
    try{
      let txt = `*⏳⃝⃘̉̉̉━⋆─⋆──❂*
*┃* \`𝗙𝗢𝗥 𝗛𝗢𝗪 𝗟𝗢𝗡𝗚?\`
*┗━━━━━━━━━━━━━❂*

*OPENED (everyone can message)*

*Reply with a number:*

*┏━「 𝚁𝚎𝙿𝙻𝚈 𝙽𝚄𝙼𝙱𝚎𝚁  ⤵️ 」*
*┃* 1️⃣ \`Until I change it back\`
*┃* 2️⃣ \`For a while, then undo automatically\`
*┗━━━━━━━━━━❥❥❥*

*<\> ${settings.footer}*`
      await sock.sendMessage(chat, { text: txt })
    }catch(e){
      await sock.sendMessage(chat, { text: "Error: " + e.message })
    }
  }
}
