module.exports = {
name: "promote",
async execute(sock, m, args, settings) {
  let chat = m.chat
  if(!chat.endsWith("@g.us")) return sock.sendMessage(chat, { text: `❌ Group only\n${settings.footer}` }, { quoted: m })
  
  let users = m.message.extendedTextMessage?.contextInfo?.mentionedJid || []
  if(m.quoted) users.push(m.quoted.sender)
  if(args[0] && args[0].includes("@")) users.push(args[0].replace("@","")+"@s.whatsapp.net")
  if(users.length===0) return sock.sendMessage(chat, { text: `*Usage:* ?promote @user or reply\n${settings.footer}` }, { quoted: m })

  try{
    const uniqueUsers = [...new Set(users.filter(Boolean))]
    await sock.groupParticipantsUpdate(chat, uniqueUsers, "promote")
    let txt = `*🤍⃝⃘̉̉̉━⋆─⋆──❂*
*┃* \`𝗣𝗥𝗢𝗠𝗢𝗧𝗘 𝗥𝗘𝗣𝗢𝗥𝗧\`
*┗━━━━━━━━━━━━━❂*

*✅ Done*

${settings.footer}`
    await sock.sendMessage(chat, { text: txt }, { quoted: m })
  }catch(e){
    console.error("PROMOTE ERROR:", e)
    await sock.sendMessage(chat, { text: `❌ Promote failed: ${e.message}\n\nMake sure the bot is an admin and the target is a valid group member.\n\n${settings.footer}` }, { quoted: m })
  }
}
}
