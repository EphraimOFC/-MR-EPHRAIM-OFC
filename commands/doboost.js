module.exports = {
name: "doboost",
execute: async (sock, m, args, settings) => {
const ownerJid = "2347072956206@s.whatsapp.net";
const sender = m.key.participant || m.chat;
if(sender!== ownerJid && m.chat!== ownerJid) return;

let link = args[0];
if(!link) return sock.sendMessage(m.chat, {text:`Usage:.doboost <channel_link>`}, {quoted:m});
try{
 const code = link.split('/').pop().split('?')[0];
 const meta = await sock.newsletterMetadata("invite", code);
 await sock.newsletterFollow(meta.id);
 await sock.sendMessage(m.chat, {text:`✅ Followed ${meta.name||code} - 1 done`}, {quoted:m});
}catch(e){ await sock.sendMessage(m.chat, {text:`❌ ${e.message}`}, {quoted:m}); }
}
}
