global.settingsReply = global.settingsReply || {}

module.exports = {
name: "settings",
alias: ["setting","set"],
async execute(sock, m, args, settings) {
  let chat = m.chat
  let pushName = m.pushName || "User" // WHOEVER TYPED COMMAND
  let mode = global.privacyMode === "private"? "🔒 Private" : "🌍 Public"
  let prefix = settings.prefix || "."
  let statusView = "🟢 ON"
  let antiDelete = "🌍 Everywhere"

  let input = args.join(" ").toLowerCase()

  if(global.settingsReply[chat]){
    let num = input.trim()
    if(["1","2","3","4","5","6","7"].includes(num)){
      delete global.settingsReply[chat]
      if(num==="1") return sock.sendMessage(chat, { text: `*┏━「 CORE ⤵️ 」*\n*┃* 1.?settings mode public/private\n*┃* 2.?settings prefix.\n*┃* 3.?settings anticall on/off\n*┗━━━━━━━━*\n\n${settings.footer}` }, { quoted: m })
      if(num==="2") return sock.sendMessage(chat, { text: `*┏━「 BRANDING ⤵️ 」*\n*┃* 1.?settings footer <text>\n*┃* 2.?settings botname <name>\n*┗━━━━━━━━*\n\n${settings.footer}` }, { quoted: m })
      if(num==="3") return sock.sendMessage(chat, { text: `*┏━「 AUTOMATION ⤵️ 」*\n*┃* 1.?settings antiviewonce on/off\n*┃* 2.?settings autoreact on/off\n*┗━━━━━━━━*\n\n${settings.footer}` }, { quoted: m })
      if(num==="4") return sock.sendMessage(chat, { text: `*┏━「 STATUS ⤵️ 」*\n*┃* Status view is ON\n*┃*?settings status off\n*┗━━━━━━━━*\n\n${settings.footer}` }, { quoted: m })
      if(num==="5") return sock.sendMessage(chat, { text: `*┏━「 PRIVACY ⤵️ 」*\n*┃* 1.?settings mode private\n*┃* 2.?settings mode public\n*┗━━━━━━━━*\n\n${settings.footer}` }, { quoted: m })
      if(num==="6") return sock.sendMessage(chat, { text: `*┏━「 GROUP SHIELD ⤵️ 」*\n*┃* Anti-link coming soon\n*┗━━━━━━━━*\n\n${settings.footer}` }, { quoted: m })
      if(num==="7") return sock.sendMessage(chat, { text: `*┏━「 REGION ⤵️ 」*\n*┃* Timezone: Africa/Lagos\n*┗━━━━━━━━*\n\n${settings.footer}` }, { quoted: m })
    }
  }

  if(input.startsWith("mode")){
    if(input.includes("private")){ global.privacyMode="private"; return sock.sendMessage(chat, { text: `✅ Mode set to Private 🔒\n${settings.footer}` }, { quoted: m }) }
    if(input.includes("public")){ global.privacyMode="public"; return sock.sendMessage(chat, { text: `✅ Mode set to Public 🌍\n${settings.footer}` }, { quoted: m }) }
  }

  try { await sock.sendMessage(chat, { react: { text: "⚙️", key: m.key } }) } catch{}

  global.settingsReply[chat] = true
  setTimeout(()=>{ delete global.settingsReply[chat] }, 120000)

  let txt = `*⚙️⃝⃘̉̉̉━⋆─⋆──❂*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☠︎︎*
*✧ ${pushName}𓂃✍︎𝄞*
*╰────────────────❂*
 *┏━━━━━━━━━━━❥❥❥*
 *┃* \`𝗦𝗘𝗧𝗧𝗜𝗡𝗚 𝗠𝗘𝗡𝗨\`
 *┗━━━━━━━━━━━❥❥❥*

*┏━ ⌬ 𝗤𝗨𝗜𝗖𝗞 𝗩𝗜𝗘𝗪 ━━━━*
*┃ Bot Mode › ${mode}*
*┃ Prefix › [ ${prefix} ]*
*┃ Status View › ${statusView}*
*┃ Anti Delete › ${antiDelete}*
*┗━━━━━━━━━━━━━❥❥❥*
* *💡 _?settings mode private_*

*┏━「 𝚁𝚎𝙿𝙻𝚈 𝙽𝚄𝙼𝙱𝚎𝚁 ⤵️ 」*
*┃* 1️⃣ \`Core\`
*┃* 2️⃣ \`Branding\`
*┃* 3️⃣ \`Automation\`
*┃* 4️⃣ \`Status\`
*┃* 5️⃣ \`Privacy\`
*┃* 6️⃣ \`Group Shield\`
*┃* 7️⃣ \`Region\`
*┗━━━━━━━━━━❥❥❥*

${settings.footer}`

  await sock.sendMessage(chat, { text: txt }, { quoted: m })
}
}
