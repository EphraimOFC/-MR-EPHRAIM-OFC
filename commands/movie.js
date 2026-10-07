const axios = require('axios')
module.exports = {
name: "movie",
alias: ["film"],
async execute(sock, m, args, settings){
try { await sock.sendMessage(m.chat, { react: { text: "✅️", key: m.key } }) } catch{}
let query = args.join(" ")
if(!query) {
  try { await sock.sendMessage(m.chat, { react: { text: "❌️", key: m.key } }) } catch{}
  return sock.sendMessage(m.chat, { text: `❌ Provide movie name\nEx:.movie John Wick` }, { quoted: m })
}
try {
  try { await sock.sendMessage(m.chat, { react: { text: "⬇️", key: m.key } }) } catch{}
  let api = `https://api.davidcyriltech.my.id/movie?query=${encodeURIComponent(query)}`
  let { data } = await axios.get(api)
  let movie = data.result || data.movies?.[0] || data

  let txt = `
*🎬⃝⃘̉̉̉━⋆─⋆──❂*
*✧ ${(m.pushName||"User").toUpperCase()}𓂃✍︎𝄞*
*╰────────────────❂*
 *┏━━━━━━━━━━━❥❥❥*
 *┃* \`𝗠𝗢𝗩𝗜𝗘 𝗦𝗘𝗔𝗥𝗖𝗛\`
 *┗━━━━━━━━━━━❥❥❥*

*📌 Title:* ${movie.title || query}
*📅 Year:* ${movie.year || movie.release_date || "N/A"}
*⭐ Rating:* ${movie.rating || movie.vote_average || "N/A"}
*🎭 Genre:* ${movie.genre || "N/A"}

*📝 Plot:* ${movie.plot || movie.overview || "No plot available"}

${settings.footer}
`
  if(movie.poster || movie.image) {
    await sock.sendMessage(m.chat, { image: { url: movie.poster || movie.image }, caption: txt }, { quoted: m })
  } else {
    await sock.sendMessage(m.chat, { text: txt }, { quoted: m })
  }
  try { await sock.sendMessage(m.chat, { react: { text: "✅️", key: m.key } }) } catch{}
} catch(e){
  try { await sock.sendMessage(m.chat, { react: { text: "❌️", key: m.key } }) } catch{}
  sock.sendMessage(m.chat, { text: `❌ Movie not found: ${query}` }, { quoted: m })
}
}
}
