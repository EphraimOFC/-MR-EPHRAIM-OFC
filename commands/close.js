module.exports = {
  name: "close",
  async execute(sock, m, args, settings) {
    let chat = m.chat
    if(!chat.endsWith("@g.us")) return sock.sendMessage(chat, { text: "Group only" })
    try{
      let txt = `*🔐⃝⃘̉̉̉━⋆─⋆──❂*
*┃* \`𝗢𝗣𝗘𝗡𝗘𝗗 (𝗘𝗩𝗘𝗥𝗬𝗢𝗡𝗘 𝗖𝗔𝗡 𝗠𝗘𝗦𝗦𝗔𝗚𝗘)?\`
*┗━━━━━━━━━━━━━❂*

*Reply with a number:*

*┏━「 𝚁𝚎𝙿𝙻𝚈 𝙽𝚄𝙼𝙱𝚎𝚁  ⤵️ 」*
*┃* 1️⃣ \`OPENED (everyone can message) now (stays until changed)\`
*┃* 2️⃣ \`OPENED (everyone can message) now, auto-undo after a time\`
*┗━━━━━━━━━━❥❥❥*

*<\> ${settings.footer}*`
      await sock.sendMessage(chat, { text: txt })
    }catch(e){
      await sock.sendMessage(chat, { text: "Error: " + e.message })
    }
  }
}
