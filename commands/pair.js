const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const fs=require('fs');
const path=require('path');
const pino=require('pino');
const { attachPairedSocket }=require('../lib/paired-bot');

module.exports={
  name:'pair',
  execute:async(sock,m,args,settings)=>{
    if(!args[0])return sock.sendMessage(m.chat,{text:'╭─〔 🔐 E TECH OFC PAIRING 〕─╮\n│ Usage: .pair 234XXXXXXXXXX\n│\n│ Use country code, digits only.\n╰────────────────────╯'},{quoted:m});
    const number=String(args[0]).replace(/[^0-9]/g,'');
    if(number.length<10||number.length>15)return sock.sendMessage(m.chat,{text:'❌ Invalid international number.'},{quoted:m});

    const sessionPath=path.resolve(settings.pairedSessionsDir||'sessions',number);
    fs.mkdirSync(sessionPath,{recursive:true});
    await sock.sendMessage(m.chat,{text:`⏳ *Preparing secure pairing...*\n\n📱 Number: *${number}*\n💾 This bot gets its own persistent session.`},{quoted:m});

    try{
      const {state,saveCreds}=await useMultiFileAuthState(sessionPath);
      if(state.creds.registered){
        attachPairedSocket(makeWASocket({auth:state,markOnlineOnConnect:false,syncFullHistory:false,emitOwnEvents:true,browser:Browsers.windows('Chrome'),logger:pino({level:'silent'})}),number,settings,sessionPath);
        return sock.sendMessage(m.chat,{text:'✅ This number already has a saved paired session. The bot runtime has been started.'},{quoted:m});
      }

      const pairSock=makeWASocket({auth:state,printQRInTerminal:false,markOnlineOnConnect:false,syncFullHistory:false,browser:Browsers.windows('Chrome'),logger:pino({level:'silent'})});
      pairSock.ev.on('creds.update',saveCreds);

      let requested=false;
      const requestCode=async()=>{
        if(requested||pairSock.authState?.creds?.registered)return;
        requested=true;
        try{
          let code=await pairSock.requestPairingCode(number);
          code=String(code).replace(/[^A-Za-z0-9]/g,'').toUpperCase();
          if(code.length!==8)throw new Error('WhatsApp returned an unexpected pairing code length: '+code.length);
          code=code.slice(0,4)+'-'+code.slice(4);
          await sock.sendMessage(m.chat,{image:{url:settings.menuImage},caption:`╭─〔 🔐 E TECH OFC PAIR CODE 〕─╮
│ 📱 Number: *${number}*
│ 🔑 Code: *${code}*
╰────────────────────╯

WhatsApp → Linked Devices → Link with phone number → enter:
*${code}*

⚠️ Enter it immediately. Never share this code.`},{quoted:m});
        }catch(e){requested=false;console.log('Pairing code request failed: '+e.message);await sock.sendMessage(m.chat,{text:'❌ Pairing code request failed: '+e.message},{quoted:m}).catch(()=>{});}
      };

      pairSock.ev.on('connection.update',async update=>{
        if(update.qr){
          try{
            const qrUrl='https://quickchart.io/qr?size=420&margin=2&ecLevel=Q&text='+encodeURIComponent(update.qr);
            await sock.sendMessage(m.chat,{image:{url:qrUrl},caption:'📲 *QR PAIRING OPTION*\n\nScan with WhatsApp → Linked Devices → Link a device.'},{quoted:m});
          }catch(e){console.log('QR send failed: '+e.message);}
        }
        if(update.connection==='connecting'||update.qr)requestCode();
        if(update.connection==='open'){
          attachPairedSocket(pairSock,number,settings,sessionPath);
          await sock.sendMessage(m.chat,{text:'╭─〔 ✅ BOT CREATED 〕─╮\n│ Your friend is now paired.\n│ 💾 Session saved permanently.\n│ 🤖 Their WhatsApp account is now the bot account.\n╰────────────────────╯'},{quoted:m});
        }
      });
      return true;
    }catch(e){
      console.log('Pairing failed: '+e.message);
      await sock.sendMessage(m.chat,{text:'❌ *Pairing failed*\n\n'+e.message},{quoted:m}).catch(()=>{});
      return false;
    }
  }
};
