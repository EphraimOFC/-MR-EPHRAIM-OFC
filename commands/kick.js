const { jidNormalizedUser } = require('@whiskeysockets/baileys');
module.exports={name:"kick",execute:async(sock,m,a,s)=>{
  if(!m.chat.endsWith("@g.us")) return sock.sendMessage(m.chat,{text:"❌ This command is for groups only."},{quoted:m});
  const meta=await sock.groupMetadata(m.chat);
  const sender=jidNormalizedUser(m.key.participant||m.key.remoteJid);
  const bot=jidNormalizedUser(sock.user?.id);
  const sp=meta.participants.find(p=>jidNormalizedUser(p.id)===sender);
  const bp=meta.participants.find(p=>jidNormalizedUser(p.id)===bot);
  const isOwner=(s.protectedNumbers||s.ownerNumbers||[]).some(n=>sender.includes(String(n)));
  if(!bp?.admin) return sock.sendMessage(m.chat,{text:"❌ Bot must be a group admin first."},{quoted:m});
  if(!sp?.admin && !isOwner) return sock.sendMessage(m.chat,{text:"❌ Only group admins or the protected owner can remove members."},{quoted:m});
  const target=m.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;
  if(!target) return sock.sendMessage(m.chat,{text:"❌ Tag or reply to the member you want to remove."},{quoted:m});
  const t=jidNormalizedUser(target);
  if((s.protectedNumbers||s.ownerNumbers||[]).some(n=>t.includes(String(n)))) return sock.sendMessage(m.chat,{text:"🛡️ Protected owner cannot be kicked."},{quoted:m});
  try{
    await sock.groupParticipantsUpdate(m.chat,[t],"remove");
    return sock.sendMessage(m.chat,{text:"╭─〔 👢 GROUP ACTION 〕─╮\n│ ✅ Member removed.\n╰────────────────────╯"},{quoted:m});
  }catch(e){ return sock.sendMessage(m.chat,{text:"❌ Kick failed: "+e.message},{quoted:m}); }
}};