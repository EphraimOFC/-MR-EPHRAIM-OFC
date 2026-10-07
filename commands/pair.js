const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const pino = require('pino');

module.exports = {
  name: "pair",
  execute: async (sock, m, args, settings) => {
    if(!args[0]) return sock.sendMessage(m.chat, {
      text: `╭─〔 🔐 E TECH OFC PAIRING 〕─╮
│ Usage: .pair 234XXXXXXXXXX
│
│ Number must include country code.
│ Example: .pair 2348012345678
╰────────────────────╯`
    }, { quoted:m });

    const number = String(args[0]).replace(/[^0-9]/g,'');
    if(number.length < 10 || number.length > 15){
      return sock.sendMessage(m.chat,{text:"❌ Invalid international number. Use country code + number, digits only."},{quoted:m});
    }

    await sock.sendMessage(m.chat,{
      text:`⏳ *Preparing secure pairing...*\n\n📱 Number: *${number}*\n🔐 Your main E TECH OFC session is kept separate.`
    },{quoted:m});

    let tempPath;
    let tempSock;
    try{
      const tempId = `temp/${Date.now()}_${number}`;
      tempPath = path.join(__dirname, '..', tempId);
      fs.mkdirSync(tempPath, { recursive:true });

      const { state, saveCreds } = await useMultiFileAuthState(tempPath);
      tempSock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        markOnlineOnConnect: false,
        browser: Browsers.ubuntu('Chrome'),
        logger: pino({ level:'silent' })
      });
      tempSock.ev.on('creds.update', saveCreds);

      let qrSent = false;
      let qrReady;
      const qrPromise = new Promise(resolve => { qrReady = resolve; });

      tempSock.ev.on('connection.update', async update => {
        if(update.qr && !qrSent){
          qrSent = true;
          try{
            const qrUrl = 'https://quickchart.io/qr?size=420&margin=2&ecLevel=Q&text=' + encodeURIComponent(update.qr);
            await sock.sendMessage(m.chat,{
              image:{url:qrUrl},
              caption:`📲 *QR PAIRING OPTION*\n\nScan this QR with WhatsApp → Linked Devices.\n\nYou can also use the 8-character pairing code sent next.\n\n⏱️ QR expires quickly.`
            },{quoted:m});
          }catch(e){ console.log('QR send failed: '+e.message); }
          qrReady();
        }
      });

      // WhatsApp's pairing flow returns an 8-character alphanumeric code.
      // Waiting for the QR event also avoids the timing race seen in pairing-code flows.
      await Promise.race([qrPromise, new Promise(resolve => setTimeout(resolve, 15000))]);

      let code = await tempSock.requestPairingCode(number);
      code = String(code).replace(/[^A-Za-z0-9]/g,'').toUpperCase();
      if(code.length !== 8) throw new Error(`WhatsApp returned an unexpected pairing code length: ${code.length}`);
      code = code.slice(0,4) + '-' + code.slice(4);

      await sock.sendMessage(m.chat,{
        image:{url:settings.menuImage},
        caption:`╭─〔 🔐 E TECH OFC PAIR CODE 〕─╮
│ 📱 Number: *${number}*
│ 🔑 Code: *${code}*
╰────────────────────╯

1️⃣ WhatsApp → Linked Devices
2️⃣ Link a device
3️⃣ Link with phone number instead
4️⃣ Enter *${code}*

⚠️ Use the code immediately. Never share it with anyone.

${settings.footer}`
      },{quoted:m});

      setTimeout(async()=>{
        try{ await tempSock.end(undefined,undefined,{reason:'pairing window expired'}); }catch{}
        try{ fs.rmSync(tempPath,{recursive:true,force:true}); }catch{}
      },180000);

      return true;
    }catch(e){
      console.log('Pairing failed:',e);
      try{ if(tempSock) await tempSock.end(); }catch{}
      try{ fs.rmSync(tempPath,{recursive:true,force:true}); }catch{}
      await sock.sendMessage(m.chat,{
        text:`❌ *Pairing failed*\n\n${e.message}\n\nTry again after a short wait if WhatsApp rate-limits pairing attempts.`
      },{quoted:m});
      return false;
    }
  }
};
