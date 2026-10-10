module.exports = {
  name: "top",
  async execute(sock, m, args, settings) {
    let chat = m.chat
    if(!chat.endsWith("@g.us")) return sock.sendMessage(chat, { text: "Group only" })

    try{
      let metadata = await sock.groupMetadata(chat)
      let groupName = metadata.subject
      let player = m.pushName || "User"

      // Check if activity is ON - change this to your DB
      // Example: let isActivityOn = db.groups[chat]?.activity || false
      let isActivityOn = false // set to true if you have it enabled

      let footer = settings.footer

      if(!isActivityOn){
        let txt = `*MONEY HEIST*
*${groupName}*

ℹ️ Activity tracking is OFF in this group.
An admin can start it:?activity on

*<\> ${footer}*`
        return await sock.sendMessage(chat, { text: txt })
      }

      // If ON - example top list
      let txtOn = `*🛡️⃝⃘̉̉̉━⋆─⋆──❂*
*✧ ${player.toUpperCase()}𓂃✍︎𝄞*
*╰────────────────❂*
*┃* \`TOP ACTIVE MEMBERS\`
*┗━━━━━━━━━━━❥❥❥*

*✨ Group :-* ${groupName}

*🏆 Top 10:*
1. @user1 - 500 msgs
2. @user2 - 320 msgs

*<\> ${footer}*`
      await sock.sendMessage(chat, { text: txtOn })

    }catch(e){
      await sock.sendMessage(chat, { text: "Error: " + e.message })
    }
  }
}
