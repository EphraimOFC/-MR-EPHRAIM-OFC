global.movieReply = global.movieReply || {}
const axios = require('axios')

module.exports = {
name: "movie",
alias: ["film","films"],
async execute(sock, m, args, settings) {
  let chat = m.chat
  let pushName = m.pushName || "User"
  let query = args.join(" ").trim()

  // HANDLE SITE SELECTION 1-5
  if(global.movieReply[chat] && ["1","2","3","4","5"].includes(query)){
    let search = global.movieReply[chat].query
    let site = ["Sinhalasub","Sub.lk","Baiscopes","Moviesublk","Cinesubz"][parseInt(query)-1]
    delete global.movieReply[chat]

    try{ await sock.sendMessage(chat, { react: { text: "🔍", key: m.key } }) }catch{}

    await sock.sendMessage(chat, { text: `*🎬 Searching ${site} for:* ${search}\n\n_⏳ Fetching results..._\n${settings.footer}` }, { quoted: m })

    // TODO: Add your actual scraping logic here
    // For now demo result
    let demo = `*🎬 ${site} Results for:* ${search}

*┏━「 RESULTS ⤵️ 」*
*┃* 1️⃣ Venom (2018) Sinhala Sub
*┃* 2️⃣ Venom: Let There Be Carnage (2021)
*┃* 3️⃣ Venom: The Last Dance (2024)
*┗━━━━━━━━━━❥❥❥*

Reply number to download

${settings.footer}`

    return sock.sendMessage(chat, { text: demo }, { quoted: m })
  }

  if(!query) return sock.sendMessage(chat, { text: `*Example:*.movie venom\n${settings.footer}` }, { quoted: m })

  try{ await sock.sendMessage(chat, { react: { text: "🎬", key: m.key } }) }catch{}

  // SAVE FOR REPLY
  global.movieReply[chat] = { query: query, time: Date.now() }
  setTimeout(()=>{ delete global.movieReply[chat] }, 120000)

  let txt = `*🎬⃝⃘̉̉̉━⋆─⋆──❂*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☠︎︎*
*✧ ${pushName}𓂃✍︎𝄞*
*╰────────────────❂*
 *┏━━━━━━━━━━━❥❥❥*
 *┃* \`𝗙𝗜𝗟𝗠 𝗦𝗘𝗔𝗥𝗖𝗛\`
 *┗━━━━━━━━━━━❥❥❥*

*✨ Search :-* ${query}
*📁 Choose a site:*

*┏━「 𝚁𝚎𝙿𝙻𝚈 𝙽𝚄𝙼𝙱𝚎𝚁 ⤵️ 」*
*┃* 1️⃣ \`Sinhalasub\`
*┃* 2️⃣ \`Sub.lk\`
*┃* 3️⃣ \`Baiscopes\`
*┃* 4️⃣ \`Moviesublk\`
*┃* 5️⃣ \`Cinesubz\`
*┗━━━━━━━━━━❥❥❥*

${settings.footer}`

  await sock.sendMessage(chat, { text: txt }, { quoted: m })
}
}
