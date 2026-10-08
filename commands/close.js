module.exports = {
name: "close",
async execute(sock, m, args, settings) {
  let chat = m.chat
  if(!chat.endsWith("@g.us")) return sock.sendMessage(chat, { text: `❌ Group only\n${settings.footer}` }, { quoted: m })
  
  try{
    await sock.groupSettingUpdate(chat, 'announcement')
    let txt = `*👁️⃝⃘̉̉̉━⋆─⋆──❂*
*┃* \`𝗚𝗥𝗢𝗨𝗣 𝗦𝗧𝗔𝗧𝗨𝗦\`
*┗━━━━━━━━━━━━━❂*

*✅ Status:* CLOSED (only admins can message)
*👤 Action by:* ${m.pushName || "Admin"}

${settings.footer}`
    await sock.sendMessage(chat, { text: txt }, { quoted: m })
  }catch(e){
    await sock.sendMessage(chat, { text: `❌ Bot not admin\n${settings.footer}` }, { quoted: m })
  }
}
}
