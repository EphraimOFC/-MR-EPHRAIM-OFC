module.exports = {
name: "demote",
async execute(sock, m, args, settings) {
  let chat = m.chat
  if(!chat.endsWith("@g.us")) return sock.sendMessage(chat, { text: `❌ Group only\n${settings.footer}` }, { quoted: m })

  let users = m.message.extendedTextMessage?.contextInfo?.mentionedJid || []
  if(m.quoted) users.push(m.quoted.sender)
  if(args[0] && args[0].includes("@")) users.push(args[0].replace("@","")+"@s.whatsapp.net")
  if(users.length===0) return sock.sendMessage(chat, { text: `*Usage:* ?demote @user or reply\n${settings.footer}` }, { quoted: m })

  try{
    await sock.groupParticipantsUpdate(chat, users, "demote")
    let txt = `*🤍⃝⃘̉̉̉━⋆─⋆──❂*
*┃* \`𝗗𝗘𝗠𝗢𝗧𝗘 𝗥𝗘𝗣𝗢𝗥𝗧\`
*┗━━━━━━━━━━━━━❂*

*✅ Done*

${settings.footer}`
    await sock.sendMessage(chat, { text: txt }, { quoted: m })
  }catch(e){
    await sock.sendMessage(chat, { text: `❌ Failed - Bot must be admin\n${settings.footer}` }, { quoted: m })
  }
}
}
