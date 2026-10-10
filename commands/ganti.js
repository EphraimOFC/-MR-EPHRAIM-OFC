module.exports = {
  name: "ganti",
  async execute(sock, m, args, settings) {
    let chat = m.chat
    if(!chat.endsWith("@g.us")) return sock.sendMessage(chat, { text: "Group only command" })

    // --- OWNER ONLY CHECK ---
    let sender = m.sender
    let ownerNumber = settings.ownerNumber || settings.owner + "@s.whatsapp.net" // change to how you saved it in settings.js
    // If owner is array
    let isOwner = false
    if(Array.isArray(settings.owner)){
      isOwner = settings.owner.some(v => sender.includes(v))
    } else {
      isOwner = sender.includes(settings.owner) || sender === ownerNumber
    }
    
    if(!isOwner) return sock.sendMessage(chat, { text: "❌ This command is owner only!" })
    // --- END CHECK ---

    try{
      let metadata = await sock.groupMetadata(chat)
      let members = metadata.participants.length
      let groupName = metadata.subject
      let player = m.pushName || "Boss"

      let txt = `*🛡️⃝⃘̉̉̉━⋆─⋆──❂*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☠︎︎*
*✧  ${player.toUpperCase()}𓂃✍︎𝄞*
*╰────────────────❂*
 *┏━━━━━━━━━━━❥❥❥*
 *┃* \`𝗚𝗥𝗢𝗨𝗣 𝗣𝗥𝗢𝗧𝗘𝗖𝗧𝗜𝗢𝗡\`
 *┗━━━━━━━━━━━❥❥❥*

*✨ 𝙶𝚛𝚘𝚞𝚙 :-* ${groupName}
*👥 𝙼𝚎𝚖𝚋𝚎𝚛𝚜 :-* ${members}

*🛡️ 𝙲𝚞𝚛𝚛𝚎𝚗𝚝 𝚂𝚝𝚊𝚝𝚞𝚜 :*
*┃ 🔗 Anti-Link:* ❌ OFF
*┃ 🤬 Anti-Badword:* ❌ OFF
*┃ 🤖 Anti-Bot:* ❌ OFF
*┃ 🏷️ Anti-Mention:* ❌ OFF
*┃ 🚀 Anti-Spam:* ❌ OFF  _(.antispam)_
*┗━━━━━━━━━━━━━❥❥❥*
*⚖️ Action:* warn  *📉 Warn limit:* 3

*「 ʀᴇᴘʟʏ ɴᴜᴍʙᴇʀ ⤵️ 」*
*┃* *1️⃣ ENABLE ANTI-LINK*
*┃* *2️⃣ ENABLE ANTI-BADWORD*
*┃* *3️⃣ ENABLE ANTI-BOT*
*┃* *4️⃣ ENABLE ANTI-MENTION*
*┃* *5️⃣ TOGGLE ALL*

*<\> ${settings.footer}*`

      await sock.sendMessage(chat, { text: txt })
    }catch(e){
      await sock.sendMessage(chat, { text: "Error: " + e.message })
    }
  }
}
