const settings = require('../settings');

module.exports = {
  name: 'antidelete',
  alias: ['antidel', 'deletealert'],
  async execute(sock, m, args) {
    const senders = [m.key.participant, m.key.participantAlt, m.key.remoteJid].filter(Boolean).map(String);
    const owners = (settings.protectedNumbers || settings.ownerNumbers || []).map(String);
    if (!owners.some(n => senders.some(s => s.includes(n)))) {
      return sock.sendMessage(m.chat, { text: '❌ Owner only.' }, { quoted: m });
    }
    const action = String(args[0] || '').toLowerCase();
    if (action === 'on') {
      global.antidelete = true;
      return sock.sendMessage(m.chat, { text: '╭─〔 🗑️ ANTI-DELETE 〕─╮\n│ 🟢 Status: *ACTIVE*\n│\n│ Deleted messages will be recovered\n│ and sent to your owner inbox.\n╰────────────────────╯' }, { quoted: m });
    }
    if (action === 'off') {
      global.antidelete = false;
      return sock.sendMessage(m.chat, { text: '╭─〔 🗑️ ANTI-DELETE 〕─╮\n│ 🔴 Status: *DISABLED*\n╰────────────────────╯' }, { quoted: m });
    }
    return sock.sendMessage(m.chat, { text: `╭─〔 🗑️ ANTI-DELETE 〕─╮\n│ Status: *${global.antidelete ? 'ACTIVE 🟢' : 'DISABLED 🔴'}*\n│\n│ .antidelete on\n│ .antidelete off\n╰────────────────────╯` }, { quoted: m });
  }
};