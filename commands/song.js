const yts = require('yt-search')
const { exec } = require('child_process')
const fs = require('fs')
const path = require('path')
const storePath = path.join(__dirname, '../tmp/song_store.json')
function getStore(){ try{ if(fs.existsSync(storePath)) return JSON.parse(fs.readFileSync(storePath)); return {} }catch{ return {} } }
function saveStore(d){ let dir=path.dirname(storePath); if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); fs.writeFileSync(storePath, JSON.stringify(d)) }
module.exports = {
 name: "song", alias: ["play","music","s"],
 async execute(m, { conn, text, args }) {
  let query = text || args.join(" ").trim()
  let buttonId = m?.message?.buttonsResponseMessage?.selectedButtonId || m?.message?.templateButtonReplyMessage?.selectedId || ""
  if(m?.message?.interactiveResponseMessage?.nativeFlowResponseMessage){ try{ let p=JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson); buttonId=p.id||"" }catch{} }
  if(buttonId.startsWith("etech_")){
     let parts=buttonId.split("_"); let type=parts[1]; let id=parts.slice(2).join("_"); let store=getStore(); let videoData=store[id];
     if(!videoData){ await conn.sendMessage(m.chat, { text: "❌ Session expired. Search again" }, { quoted: m }); return false }
     await conn.sendMessage(m.chat, { text: `⬇️ Downloading *${videoData.title}*...` }, { quoted: m })
     let fileName=path.join(__dirname, `../tmp/${id}.mp3`); let dir=path.dirname(fileName); if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true});
     let ytdlpCmd=`yt-dlp -x --audio-format mp3 --no-playlist -o "${fileName}" "${videoData.url}"`;
     exec(ytdlpCmd, async (err) => {
      if(err ||!fs.existsSync(fileName)){ await conn.sendMessage(m.chat, { text: "❌ Download failed on server. Install yt-dlp + ffmpeg on host." }, { quoted: m }); return false }
      if(type==='audio'){ await conn.sendMessage(m.chat, { audio: fs.readFileSync(fileName), mimetype: 'audio/mpeg' }, { quoted: m }) }
      else{ await conn.sendMessage(m.chat, { document: fs.readFileSync(fileName), mimetype: 'audio/mpeg', fileName: `${videoData.title}.mp3` }, { quoted: m }) }
      try{ fs.unlinkSync(fileName) }catch{}; let ns=getStore(); delete ns[id]; saveStore(ns); return true;
     }); return
  }
  if(!query){ await conn.sendMessage(m.chat, { text: "🎵 Example:.song Seyi Vibez - Chance" }, { quoted: m }); return false }
  let search = await yts(query + " song"); if(!search.videos.length){ await conn.sendMessage(m.chat, { text: "❌ No song found" }, { quoted: m }); return false }
  let video=search.videos[0]; let videoId=Date.now().toString(); let store=getStore(); store[videoId]={ url: video.url, title: video.title }; saveStore(store);
  let caption=`*🎵 E TECH SONG DOWNLOADER*\n\n*Title:* ${video.title}\n*Duration:* ${video.timestamp}\n\n${conn.user.name || "E TECH OFC"}\n\n${require('../settings').footer}`
  await conn.sendMessage(m.chat, {
    image: { url: video.thumbnail },
    caption: caption,
    footer: "Choose format 👇",
    buttons: [
      {
        buttonId: `etech_audio_${videoId}`,
        buttonText: { displayText: "🎧 AUDIO" },
        type: 1
      },
      {
        buttonId: `etech_doc_${videoId}`,
        buttonText: { displayText: "📁 DOCUMENT" },
        type: 1
      }
    ],
    headerType: 4
  }, { quoted: m })
  return true
 }
}
