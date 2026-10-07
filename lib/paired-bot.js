const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, jidNormalizedUser } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const pino = require('pino');

const sockets = new Map();

function loadCommands(){
  const map=new Map(), dir=path.join(__dirname,'..','commands');
  if(!fs.existsSync(dir)) return map;
  for(const file of fs.readdirSync(dir)){
    if(!file.endsWith('.js')) continue;
    try{
      const cmd=require(path.join(dir,file));
      if(!cmd?.name||typeof cmd.execute!=='function') continue;
      const name=String(cmd.name).toLowerCase();
      if(!map.has(name)) map.set(name,cmd);
      for(const alias of (cmd.alias||[])){
        const key=String(alias).toLowerCase();
        if(!map.has(key)) map.set(key,cmd);
      }
    }catch(e){console.log('Paired command load failed '+file+': '+e.message);}
  }
  return map;
}

function ownerMatch(jid,settings){
  const normalized=jidNormalizedUser(jid||'');
  return (settings.protectedNumbers||settings.ownerNumbers||[]).some(n=>normalized.includes(String(n)));
}

function wrapSend(sock,settings){
  if(sock.__eTechWrapped) return;
  sock.__eTechWrapped=true;
  const raw=sock.sendMessage.bind(sock), footer=String(settings.footer||'').trim();
  const hasFooter=v=>typeof v==='string'&&(v.includes('MR EPHRAIM OFC')||v.includes('Powered by N TECH PRO'));
  sock.sendMessage=async(jid,content,options)=>{
    if(!content||typeof content!=='object') return raw(jid,content,options);
    const next={...content};
    if(typeof next.text==='string'&&footer&&!hasFooter(next.text)) next.text=next.text.trimEnd()+'\n\n'+footer;
    if(typeof next.caption==='string'&&footer&&!hasFooter(next.caption)) next.caption=next.caption.trimEnd()+'\n\n'+footer;
    else if(footer&&(next.image||next.video||next.document)&&!next.caption) next.caption=footer;
    return raw(jid,next,options);
  };
}

function attachPairedSocket(sock,ownerNumber,baseSettings,sessionPath){
  const key=String(ownerNumber);
  if(sockets.has(key)&&sockets.get(key)!==sock) return sockets.get(key);
  sockets.set(key,sock);
  const settings={...baseSettings,ownerNumber:key,ownerNumbers:[key],protectedNumbers:[key],ownerName:baseSettings.ownerName||'BOT OWNER'};
  wrapSend(sock,settings);
  const commands=loadCommands();

  const run=async(cmd,m,args)=>{
    try{return await cmd.execute(sock,m,args,settings);}
    catch(e){console.log('Paired command failed '+cmd.name+': '+e.message);await sock.sendMessage(m.chat,{text:'❌ Command failed: '+e.message},{quoted:m}).catch(()=>{});return false;}
  };

  sock.ev.on('messages.upsert',async({messages})=>{
    for(const m of messages||[]){
      try{
        if(!m?.message||m.key?.fromMe) continue;
        m.chat=m.key.remoteJid;if(!m.chat)continue;
        let body=m.message.conversation||m.message.extendedTextMessage?.text||m.message.buttonsResponseMessage?.selectedButtonId||m.message.templateButtonReplyMessage?.selectedId||'';
        if(m.message?.interactiveResponseMessage?.nativeFlowResponseMessage){try{const p=JSON.parse(m.message.interactiveResponseMessage.nativeFlowResponseMessage.paramsJson);if(p.id)body=p.id;}catch{}}
        if(m.message?.listResponseMessage?.singleSelectReply?.selectedRowId)body=m.message.listResponseMessage.singleSelectReply.selectedRowId;
        body=String(body||'').trim();if(!body)continue;
        const sender=m.key.participant||m.key.remoteJid,isOwner=ownerMatch(sender,settings);
        if(global.privacyMode==='private'&&!isOwner)continue;
        if(body==='main_menu'){const c=commands.get('menu');if(c)await run(c,m,[]);continue;}
        if(body==='create_bot'){const c=commands.get('bot');if(c)await run(c,m,[]);continue;}
        if(body==='visit_site'){await sock.sendMessage(m.chat,{text:'🌐 *E TECH OFC WEBSITE*\n\n'+settings.botLink},{quoted:m});continue;}
        if(!body.startsWith(settings.prefix))continue;
        const parts=body.slice(settings.prefix.length).trim().split(/\s+/),name=(parts.shift()||'').toLowerCase(),cmd=commands.get(name);
        if(!cmd)continue;
        const ownerOnly=['setting','settings','set','privacy','ownermenu','ban','unban','setcall','creact'];
        if(ownerOnly.includes(name)&&!isOwner){await sock.sendMessage(m.chat,{text:'❌ *OWNER ONLY*\n\nOnly the owner of this paired bot can use that command.'},{quoted:m});continue;}
        await run(cmd,m,parts);
      }catch(e){console.log('Paired message handler failed: '+e.message);}
    }
  });

  sock.ev.on('connection.update',async(update)=>{
    if(update.connection==='open') console.log('✅ Paired bot online: '+key);
    if(update.connection==='close'){
      const code=update.lastDisconnect?.error?.output?.statusCode;
      sockets.delete(key);
      if(code===DisconnectReason.loggedOut){
        try{fs.rmSync(sessionPath,{recursive:true,force:true});}catch{}
        console.log('🔐 Paired bot logged out: '+key);
        return;
      }
      setTimeout(()=>startPairedBot(sessionPath,key,baseSettings).catch(e=>console.log('Paired reconnect failed '+key+': '+e.message)),3000);
    }
  });
  return sock;
}

async function startPairedBot(sessionPath,ownerNumber,baseSettings){
  const key=String(ownerNumber);
  if(sockets.has(key)) return sockets.get(key);
  fs.mkdirSync(sessionPath,{recursive:true});
  const {state,saveCreds}=await useMultiFileAuthState(sessionPath);
  const sock=makeWASocket({auth:state,markOnlineOnConnect:false,syncFullHistory:false,emitOwnEvents:true,browser:Browsers.windows('Chrome'),logger:pino({level:'silent'})});
  sock.ev.on('creds.update',saveCreds);
  return attachPairedSocket(sock,key,baseSettings,sessionPath);
}

async function startAllPairedBots(baseSettings){
  const root=path.resolve(baseSettings.pairedSessionsDir||'sessions');
  if(!fs.existsSync(root))return;
  for(const entry of fs.readdirSync(root,{withFileTypes:true})){
    if(!entry.isDirectory()||!/^[0-9]{10,15}$/.test(entry.name))continue;
    try{await startPairedBot(path.join(root,entry.name),entry.name,baseSettings);}catch(e){console.log('Failed paired bot '+entry.name+': '+e.message);}
  }
}

module.exports={startPairedBot,startAllPairedBots,attachPairedSocket};
