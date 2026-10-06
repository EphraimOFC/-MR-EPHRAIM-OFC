const yts = require('yt-search')
const { exec } = require('child_process')
const { generateWAMessageFromContent, prepareWAMessageMedia, proto } = require('@whiskeysockets/baileys')
const fs = require('fs')
const path = require('path')
const storePath = path.join(__dirname, '../tmp/song_store.json')
function getStore(){ try{ if(fs.existsSync(storePath)) return JSON.parse(fs.readFileSync(storePath)); return {} }catch{ return {} } }
function saveStore(d){ let dir=path.dirname(storePath); if(!fs.existsSync(dir)) fs.mkdirSync(dir,{recursive:true}); fs.writeFileSync(storePath, JSON.stringify(d)) }
async function sendSongButtons(conn, m, caption, thumbnail, videoId) {
 const media = await prepareWAMessageMedia(
  { image: { url: thumbnail } },
  { upload: conn.waUploadToServer }
 );
 const buttons = [
  proto.Message.InteractiveMessage.NativeFlowMessage.NativeFlowButton.create({
   name: 'quick_reply',
   buttonParamsJson: JSON.stringify({ display_text: '🎧 AUDIO', id: `etech_audio_${videoId}` })
  }),
  proto.Message.InteractiveMessage.NativeFlowMessage.NativeFlowButton.create({
   name: 'quick_reply',
   buttonParamsJson: JSON.stringify({ display_text: '📁 DOCUMENT', id: `etech_doc_${videoId}` })
  })
 ];
 const interactiveMessage = proto.Message.InteractiveMessage.create({
  header: proto.Message.InteractiveMessage.Header.create({
   title: '🎵 E TECH SONG DOWNLOADER',
   hasMediaAttachment: true,
   ...media
  }),
  body: proto.Message.InteractiveMessage.Body.create({ text: caption }),
  footer: proto.Message.InteractiveMessage.Footer.create({ text: 'Choose format 👇' }),
  nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
   buttons,
   messageParamsJson: '{}',
   messageVersion: 1
  })
 });
 const msg = generateWAMessageFromContent(
  m.chat,
  {
   viewOnceMessage: {
    message: {
     messageContextInfo: {
      deviceListMetadata: {},
      deviceListMetadataVersion: 2
     },
     interactiveMessage
    }
   }
  },
  { quoted: m, userJid: conn.user.id }
 );
 const bizNode = {
  tag: 'biz',
  attrs: {
   actual_actors: '2',
   host_storage: '2',
   privacy_mode_ts: String(Math.floor(Date.now() / 1000) - 77980457)
  },
  content: [
   {
    tag: 'interactive',
    attrs: { type: 'native_flow', v: '1' },
    content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }]
   },
   {
    tag: 'quality_control',
    attrs: { source_type: 'third_party' }
   }
  ]
 };
 const additionalNodes = m.chat.endsWith('@g.us')
  ? [bizNode]
  : [{ tag: 'bot', attrs: { biz_bot: '1' } }, bizNode];
 await conn.relayMessage(m.chat, msg.message, {
  messageId: msg.key.id,
  additionalNodes
 });
}

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
     const downloadResult = await new Promise((resolve) => {
      exec(ytdlpCmd, async (err) => {
       if(err || !fs.existsSync(fileName)){
        await conn.sendMessage(m.chat, { text: "❌ Download failed on server. Install yt-dlp + ffmpeg on host." }, { quoted: m });
        return resolve(false);
       }
       try{
        if(type==='audio'){
         await conn.sendMessage(m.chat, { audio: fs.readFileSync(fileName), mimetype: 'audio/mpeg' }, { quoted: m });
        } else {
         await conn.sendMessage(m.chat, { document: fs.readFileSync(fileName), mimetype: 'audio/mpeg', fileName: `${videoData.title}.mp3` }, { quoted: m });
        }
        return resolve(true);
       }catch(error){
        await conn.sendMessage(m.chat, { text: "❌ Could not send downloaded song: " + error.message }, { quoted: m }).catch(()=>{});
        return resolve(false);
       }finally{
        try{ fs.unlinkSync(fileName) }catch{}
        let ns=getStore(); delete ns[id]; saveStore(ns);
       }
      });
     });
     return downloadResult;; return
  }
  if(!query){ await conn.sendMessage(m.chat, { text: "🎵 Example:.song Seyi Vibez - Chance" }, { quoted: m }); return false }
  let search = await yts(query + " song"); if(!search.videos.length){ await conn.sendMessage(m.chat, { text: "❌ No song found" }, { quoted: m }); return false }
  let video=search.videos[0]; let videoId=Date.now().toString(); let store=getStore(); store[videoId]={ url: video.url, title: video.title }; saveStore(store);
  let caption=`*🎵 E TECH SONG DOWNLOADER*\n\n*Title:* ${video.title}\n*Duration:* ${video.timestamp}\n\n${conn.user.name || "E TECH OFC"}\n\n${require('../settings').footer}`
  await sendSongButtons(conn, m, caption, video.thumbnail, videoId)
  return true
 }
}
