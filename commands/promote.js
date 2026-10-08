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
    const metadata = await sock.groupMetadata(chat)
    const botId = sock.user?.id?.split(":")[0] + "@s.whatsapp.net"
    const botAlt = sock.user?.lid || sock.user?.id
    const botParticipant = metadata.participants?.find(x =>
      x.id === botId ||
      x.id === botAlt ||
      x.jid === botId ||
      x.jid === botAlt ||
      x.lid === botAlt
    )

    if(!botParticipant?.admin){
      return sock.sendMessage(chat, { text: `❌ I must be a group admin to promote members.\n\n${settings.footer}` }, { quoted: m })
    }

    await sock.groupParticipantsUpdate(chat, users, "promote")
    let txt = `*🤍⃝⃘̉̉̉━⋆─⋆──❂*
*┃* \`𝗣𝗥𝗢𝗠𝗢𝗧𝗘 𝗥𝗘𝗣𝗢𝗥𝗧\`
*┗━━━━━━━━━━━━━❂*

*✅ Done*

${settings.footer}`
    await sock.sendMessage(chat, { text: txt }, { quoted: m })
  }catch(e){
    console.error("PROMOTE ERROR:", e)
    await sock.sendMessage(chat, { text: `❌ Promote failed: ${e.message}\n${settings.footer}` }, { quoted: m })
  }
}
}
