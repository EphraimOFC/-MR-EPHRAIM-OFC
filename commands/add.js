const { jidNormalizedUser } = require('@whiskeysockets/baileys');
module.exports={name:"add",execute:async(sock,m,a,s)=>{
  if(!m.chat.endsWith("@g.us")) return sock.sendMessage(m.chat,{text:"❌ This command is for groups only."},{quoted:m});
  const meta=await sock.groupMetadata(m.chat);
  const sender=jidNormalizedUser(m.key.participant||m.key.remoteJid);
  const bot=jidNormalizedUser(sock.user?.id);
  const sp=meta.participants.find(p=>jidNormalizedUser(p.id)===sender);
  const bp=meta.participants.find(p=>jidNormalizedUser(p.id)===bot);
  const isOwner=(s.protectedNumbers||s.ownerNumbers||[]).some(n=>sender.includes(String(n)));
  if(!bp?.admin) return sock.sendMessage(m.chat,{text:"❌ Bot must be a group admin first."},{quoted:m});
  if(!sp?.admin && !isOwner) return sock.sendMessage(m.chat,{text:"❌ Only group admins or the protected owner can add members."},{quoted:m});
  const num=String(a[0]||"").replace(/[^0-9]/g,"");
  if(!num) return sock.sendMessage(m.chat,{text:"❌ Usage: .add 2348012345678"},{quoted:m});
  try{
    await sock.groupParticipantsUpdate(m.chat,[num+"@s.whatsapp.net"],"add");
    return sock.sendMessage(m.chat,{text:"╭─〔 ➕ GROUP ACTION 〕─╮\n│ ✅ Member add request sent.\n╰────────────────────╯"},{quoted:m});
  }catch(e){ return sock.sendMessage(m.chat,{text:"❌ Add failed: "+e.message},{quoted:m}); }
}};