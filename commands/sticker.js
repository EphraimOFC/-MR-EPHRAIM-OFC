const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');

function getQuoted(m){
  const ctx = m.message?.extendedTextMessage?.contextInfo;
  if(!ctx?.quotedMessage) return null;
  return {
    key: {
      remoteJid: m.chat,
      id: ctx.stanzaId,
      participant: ctx.participant
    },
    message: ctx.quotedMessage
  };
}

module.exports = {
  name: "sticker",
  alias: ["s"],
  execute: async (sock, m, args, settings) => {
    const quoted = getQuoted(m);
    const source = quoted || m;
    const msg = source?.message || {};
    const type = Object.keys(msg).find(k => ['imageMessage','videoMessage','documentMessage'].includes(k));
    if(!type) return sock.sendMessage(m.chat,{text:'❌ Reply to an image/video with .sticker'},{quoted:m});

    const media = msg[type];
    if(type === 'documentMessage' && !/^image\//.test(media.mimetype||'') && !/^video\//.test(media.mimetype||'')){
      return sock.sendMessage(m.chat,{text:'❌ Only image or video media can be converted to sticker.'},{quoted:m});
    }

    const tmpDir = path.join(__dirname,'../tmp');
    fs.mkdirSync(tmpDir,{recursive:true});
    const id = Date.now();
    const input = path.join(tmpDir,`sticker_${id}_in`);
    const output = path.join(tmpDir,`sticker_${id}.webp`);

    try{
      const buffer = await downloadMediaMessage(
        source,
        'buffer',
        {},
        { logger: sock.logger, reuploadRequest: sock.updateMediaMessage }
      );
      fs.writeFileSync(input, buffer);

      const vf = 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000';
      const argsFF = type === 'imageMessage' || (type === 'documentMessage' && /^image\//.test(media.mimetype||''))
        ? ['-y','-i',input,'-vf',vf,'-frames:v','1','-c:v','libwebp','-q:v','80',output]
        : ['-y','-i',input,'-t','6','-vf',vf+',fps=12','-c:v','libwebp','-q:v','70','-loop','0',output];

      await new Promise((resolve,reject)=>{
        execFile('ffmpeg',argsFF,{windowsHide:true},(error,stdout,stderr)=>error?reject(error):resolve());
      });

      if(!fs.existsSync(output)) throw new Error('FFmpeg did not create sticker');
      await sock.sendMessage(m.chat,{sticker:fs.readFileSync(output)},{quoted:m});
    }catch(e){
      await sock.sendMessage(m.chat,{text:`❌ Sticker failed: ${e.message}\nMake sure FFmpeg is installed and available in PATH.`},{quoted:m}).catch(()=>{});
    }finally{
      for(const file of [input,output]){ try{fs.unlinkSync(file)}catch{} }
    }
  }
};