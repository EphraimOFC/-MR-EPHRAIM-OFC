global.settingsReply = global.settingsReply || {}
global.privacySettings = global.privacySettings || {
  antiDelete: "🌍 Everywhere",
  antiEdit: "🔴 Off",
  viewOnce: "🟢 ON",
  alerts: "↩️ Same chat"
}

module.exports = {
name: "settings",
alias: ["setting","set"],
async execute(sock, m, args, settings) {
  let chat = m.chat
  let pushName = m.pushName || "User"
  let input = args.join(" ").toLowerCase().trim()
  let mode = global.privacyMode === "private"? "🔒 Private" : "🌍 Public"

  // ===== PRIVACY SUB MENU =====
  if(global.settingsReply[chat] === "privacy"){
    if(input==="1"){
      global.privacySettings.antiDelete = global.privacySettings.antiDelete.includes("Everywhere")? "🔴 Off" : "🌍 Everywhere"
      await sock.sendMessage(chat, { text: `✅ Anti Delete: ${global.privacySettings.antiDelete}\n${settings.footer}` }, { quoted: m })
    } else if(input==="2"){
      global.privacySettings.antiEdit = global.privacySettings.antiEdit.includes("Off")? "🟢 ON" : "🔴 Off"
      await sock.sendMessage(chat, { text: `✅ Anti Edit: ${global.privacySettings.antiEdit}\n${settings.footer}` }, { quoted: m })
    } else if(input==="3"){
      global.antiviewonce =!global.antiviewonce
      global.privacySettings.viewOnce = global.antiviewonce? "🟢 ON" : "🔴 Off"
      await sock.sendMessage(chat, { text: `✅ View-Once: ${global.privacySettings.viewOnce}\n${settings.footer}` }, { quoted: m })
    } else if(input==="4"){
      global.privacySettings.alerts = global.privacySettings.alerts.includes("Same")? "👤 Owner" : "↩️ Same chat"
      await sock.sendMessage(chat, { text: `✅ Alerts: ${global.privacySettings.alerts}\n${settings.footer}` }, { quoted: m })
    } else if(input==="0"){
      global.settingsReply[chat] = "main"
      return module.exports.execute(sock, m, [], settings)
    }
    if(["1","2","3","4"].includes(input)){
      let ptxt = `*🕵️⃝⃘̉̉̉━⋆─❂*
*┃* \`𝗣𝗥𝗜𝗩𝗔𝗖𝗬\`
*┗━━━━━━━━━━❂*

*┏━「 𝚁𝚎𝙿𝙻𝚈 𝙽𝚄𝙼𝙱𝚎𝚁 ⤵️ 」*
*┃* 1️⃣ \`Anti Delete\` › ${global.privacySettings.antiDelete}
*┃* 2️⃣ \`Anti Edit\` › ${global.privacySettings.antiEdit}
*┃* 3️⃣ \`View-Once Unlock\` › ${global.privacySettings.viewOnce}
*┃* 4️⃣ \`Alerts Go To\` › ${global.privacySettings.alerts}
*┃* 0️⃣ \`Back\`
*┗━━━━━━━━━━❥❥❥*
${settings.footer}`
      return sock.sendMessage(chat, { text: ptxt }, { quoted: m })
    }
  }

  // ===== CORE SUB MENU =====
  if(global.settingsReply[chat] === "core"){
    if(input==="1"){
      global.privacyMode = global.privacyMode==="public"? "private" : "public"
      await sock.sendMessage(chat, { text: `✅ Bot Mode: ${global.privacyMode}\n${settings.footer}` }, { quoted: m })
    } else if(input==="2"){
      // Prefix change example
      await sock.sendMessage(chat, { text: `*Current Prefix:* ${settings.prefix}\nUse:?settings prefix.\n${settings.footer}` }, { quoted: m })
    } else if(input==="3"){
      global.anticall =!global.anticall
      await sock.sendMessage(chat, { text: `✅ AntiCall: ${global.anticall? "🟢 ON":"🔴 Off"}\n${settings.footer}` }, { quoted: m })
    } else if(input==="0"){
      global.settingsReply[chat] = "main"
      return module.exports.execute(sock, m, [], settings)
    }
    if(["1","2","3"].includes(input)){
      let cMode = global.privacyMode==="private"? "🔒 Private" : "🌍 Public"
      let ctxt = `*⚙️⃝⃘̉̉̉━⋆─❂*
*┃* \`𝗖𝗢𝗥𝗘\`
*┗━━━━━━━━━━❂*

*┏━「 𝚁𝚎𝙿𝙻𝚈 𝙽𝚄𝙼𝙱𝚎𝚁 ⤵️ 」*
*┃* 1️⃣ \`Bot Mode\` › ${cMode}
*┃* 2️⃣ \`Prefix\` › [ ${settings.prefix} ]
*┃* 3️⃣ \`Anti Call\` › ${global.anticall? "🟢 ON":"🔴 Off"}
*┃* 0️⃣ \`Back\`
*┗━━━━━━━━━━❥❥❥*
* Switches flip instantly

${settings.footer}`
      return sock.sendMessage(chat, { text: ctxt }, { quoted: m })
    }
  }

  // ===== MAIN MENU HANDLER =====
  if(global.settingsReply[chat] === "main"){
    let num = input
    if(num==="5"){
      global.settingsReply[chat] = "privacy"
      let ptxt = `*🕵️⃝⃘̉̉̉━⋆─❂*
*┃* \`𝗣𝗥𝗜𝗩𝗔𝗖𝗬\`
*┗━━━━━━━━━━❂*

*┏━「 𝚁𝚎𝙿𝙻𝚈 𝙽𝚄𝙼𝙱𝚎𝚁 ⤵️ 」*
*┃* 1️⃣ \`Anti Delete\` › ${global.privacySettings.antiDelete}
*┃* 2️⃣ \`Anti Edit\` › ${global.privacySettings.antiEdit}
*┃* 3️⃣ \`View-Once Unlock\` › ${global.privacySettings.viewOnce}
*┃* 4️⃣ \`Alerts Go To\` › ${global.privacySettings.alerts}
*┃* 0️⃣ \`Back\`
*┗━━━━━━━━━━❥❥❥*
${settings.footer}`
      return sock.sendMessage(chat, { text: ptxt }, { quoted: m })
    }
    if(num==="1"){
      global.settingsReply[chat] = "core"
      let cMode = global.privacyMode==="private"? "🔒 Private" : "🌍 Public"
      let ctxt = `*⚙️⃝⃘̉̉̉━⋆─❂*
*┃* \`𝗖𝗢𝗥𝗘\`
*┗━━━━━━━━━━❂*

*┏━「 𝚁𝚎𝙿𝙻𝚈 𝙽𝚄𝙼𝙱𝚎𝚁 ⤵️ 」*
*┃* 1️⃣ \`Bot Mode\` › ${cMode}
*┃* 2️⃣ \`Prefix\` › [ ${settings.prefix} ]
*┃* 3️⃣ \`Anti Call\` › ${global.anticall? "🟢 ON":"🔴 Off"}
*┃* 0️⃣ \`Back\`
*┗━━━━━━━━━━❥❥❥*
* Switches flip instantly

${settings.footer}`
      return sock.sendMessage(chat, { text: ctxt }, { quoted: m })
    }
    if(num==="2") return sock.sendMessage(chat, { text: `*┏━「 BRANDING ⤵️ 」*\n*┃* Coming soon\n*┗━━━━━━━━*\n${settings.footer}` }, { quoted: m })
    if(num==="3") return sock.sendMessage(chat, { text: `*┏━「 AUTOMATION ⤵️ 」*\n*┃*?settings anticall on/off\n*┗━━━━━━━━*\n${settings.footer}` }, { quoted: m })
    if(num==="4") return sock.sendMessage(chat, { text: `*┏━「 STATUS ⤵️ 」*\n*┃* ON\n*┗━━━━━━━━*\n${settings.footer}` }, { quoted: m })
    if(num==="6") return sock.sendMessage(chat, { text: `*┏━「 GROUP SHIELD ⤵️ 」*\n*┃* Coming soon\n*┗━━━━━━━━*\n${settings.footer}` }, { quoted: m })
    if(num==="7") return sock.sendMessage(chat, { text: `*┏━「 REGION ⤵️ 」*\n*┃* Africa/Lagos\n*┗━━━━━━━━*\n${settings.footer}` }, { quoted: m })
  }

  if(input.startsWith("mode")){
    if(input.includes("private")){ global.privacyMode="private"; return sock.sendMessage(chat, { text: `✅ Mode: Private 🔒\n${settings.footer}` }, { quoted: m }) }
    if(input.includes("public")){ global.privacyMode="public"; return sock.sendMessage(chat, { text: `✅ Mode: Public 🌍\n${settings.footer}` }, { quoted: m }) }
  }

  try { await sock.sendMessage(chat, { react: { text: "⚙️", key: m.key } }) } catch{}
  global.settingsReply[chat] = "main"
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
*┃ Prefix › [? ]*
*┃ Status View › 🟢 ON*
*┃ Anti Delete › ${global.privacySettings.antiDelete}*
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
