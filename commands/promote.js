const { jidNormalizedUser } = require('@whiskeysockets/baileys');
module.exports={name:"promote",execute:async(sock,m,args,s)=>{
  if(!m.chat.endsWith("@g.us")) return sock.sendMessage(m.chat,{text:"❌ This command is for groups only."},{quoted:m});
  const meta=await sock.groupMetadata(m.chat);
  const sender=jidNormalizedUser(m.key.participant||m.key.remoteJid);
  const botIds = [sock.user?.id, sock.user?.lid, sock.user?.phoneNumber].filter(Boolean).map(String);
  const sp=meta.participants.find(p => [p.id, p.lid, p.phoneNumber].filter(Boolean).some(id => jidNormalizedUser(id) === sender));
  const bp=meta.participants.find(p => [p.id, p.lid, p.phoneNumber].filter(Boolean).some(id => botIds.some(b => jidNormalizedUser(id) === jidNormalizedUser(b))));
  const botIsAdmin = !!(bp && (bp.admin === 'admin' || bp.admin === 'superadmin' || bp.isAdmin || bp.isSuperAdmin));
  const isOwner=(s.protectedNumbers||s.ownerNumbers||[]).some(n=>sender.includes(String(n)));
  if(!botIsAdmin) return sock.sendMessage(m.chat,{text:"❌ Bot must be a group admin first."},{quoted:m});
  if(!sp?.admin && !isOwner) return sock.sendMessage(m.chat,{text:"❌ Only group admins or the protected owner can promote members."},{quoted:m});
  const target=m.mentionedJid?.[0] || m.message?.extendedTextMessage?.contextInfo?.participant;
  if(!target) return sock.sendMessage(m.chat,{text:"❌ Tag or reply to the member you want to promote."},{quoted:m});
  const t=jidNormalizedUser(target);
  if((s.protectedNumbers||s.ownerNumbers||[]).some(n=>t.includes(String(n)))) return sock.sendMessage(m.chat,{text:"🛡️ Protected owner cannot be changed by this command."},{quoted:m});
  try{
    await sock.groupParticipantsUpdate(m.chat,[t],"promote");
    return sock.sendMessage(m.chat,{text:"╭─〔 👑 GROUP ACTION 〕─╮\n│ ✅ Member promoted to admin.\n╰────────────────────╯"},{quoted:m});
  }catch(e){ return sock.sendMessage(m.chat,{text:"❌ Promote failed: "+e.message},{quoted:m}); }
}};