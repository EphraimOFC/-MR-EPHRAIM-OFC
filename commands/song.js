const yts = require('yt-search')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')

const storePath = "./tmp/song_store.json"
function getStore(){
  try{ if(!fs.existsSync(storePath)) return {}; return JSON.parse(fs.readFileSync(storePath)) }catch{ return {} }
}
function saveStore(data){
  let dir = path.dirname(storePath)
  if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true})
  fs.writeFileSync(storePath, JSON.stringify(data))
}

module.exports = {
  name: "song",
  alias: ["play", "music", "s"],
  async execute(m, { conn, text, args }) {
    let query = text || (args? args.join(" ") : "")
    let buttonId = m?.message?.buttonsResponseMessage?.selectedButtonId || m?.message?.templateButtonReplyMessage?.selectedId || query
    let isButton = buttonId.startsWith("etech_audio_") || buttonId.startsWith("etech_doc_")
    let id = ""
    let type = ""
    if(isButton){
      let parts = buttonId.split("_")
      type = parts[1]
      id = parts.slice(2).join("_")
    }

    if(isButton){
      let store = getStore()
      let videoData = store[id]
      if(!videoData){
        return await conn.sendMessage(m.chat, { text: "Session expired, search again:.song <name>" }, { quoted: m })
      }
      let tmpDir = "./tmp"
      if(!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir,{recursive:true})
      let fileName = path.join(tmpDir, `${Date.now()}.mp3`)

      await conn.sendMessage(m.chat, { text: `_Downloading ${type.toUpperCase()}..._ ⏳` }, { quoted: m })

      exec(`yt-dlp -x --audio-format mp3 --no-playlist -o "${fileName}" "${videoData.url}"`, async (err) => {
        if(err ||!fs.existsSync(fileName)){
          return await conn.sendMessage(m.chat, { text: "Download failed." }, { quoted: m })
        }
        let buffer = fs.readFileSync(fileName)
        if(type === "doc"){
          await conn.sendMessage(m.chat, { document: buffer, mimetype: 'audio/mpeg', fileName: `${videoData.title}.mp3` }, { quoted: m })
        } else {
          await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/mpeg', fileName: `${videoData.title}.mp3` }, { quoted: m })
        }
        try{ fs.unlinkSync(fileName) }catch{}
      })
      return
    }

    if(!query) return await conn.sendMessage(m.chat, { text: "Use:.song victony holy father" }, { quoted: m })

    try{
      let search = await yts(query)
      let video = search.videos[0]
      if(!video) return await conn.sendMessage(m.chat, { text: "Not found" }, { quoted: m })

      let uniqId = Date.now().toString()
      let store = getStore()
      store[uniqId] = { url: video.url, title: video.title }
      saveStore(store)

      let caption = `┌───⭓ *SONG DOWNLOADER* ⭓───┐

✨ *Title :-* ${video.title}
👤 *Author :-* ${video.author.name}
👁️ *Views :-* ${video.views}
⏰ *Ago :-* ${video.ago}
⏱️ *Duration :-* ${video.timestamp}
🔗 *Url :-* ${video.url}

*Choose format below* 👇

> 👨‍💻 Develop By *ᴍʀ ᴇᴘʜʀᴀɪᴍ ᴏꜰᴄ*
> *© Powered by E TECH OFC™*`

      await conn.sendMessage(m.chat, {
        image: { url: video.thumbnail },
        caption: caption,
        footer: "© E TECH OFC™",
        buttons: [
          { buttonId: `etech_audio_${uniqId}`, buttonText: { displayText: "AUDIO 🎧" }, type: 1 },
          { buttonId: `etech_doc_${uniqId}`, buttonText: { displayText: "DOCUMENT 📁" }, type: 1 }
        ],
        headerType: 4
      }, { quoted: m })

    }catch(e){
      await conn.sendMessage(m.chat, { text: "Error: "+e.message }, { quoted: m })
    }
  }
        }
