module.exports = {
name: "ping",
execute: async (sock, m, args, settings) => {
  const start = Date.now();
  const msg = await sock.sendMessage(m.key.remoteJid, { text: "*Pinging E TECH OFC...* ⚡" }, { quoted: m });
  const latency = Date.now() - start;
  const uptime = process.uptime();
  const hours = Math.floor(uptime / 3600);
  const mins = Math.floor((uptime % 3600) / 60);
  const secs = Math.floor(uptime % 60);

  const text = `
╭───◐ *E TECH OFC PING* ◐───
│ ⚡ *Speed:* ${latency}ms
│ ⏱️ *Uptime:* ${hours}h ${mins}m ${secs}s
│ 🤖 *Bot:* E TECH OFC V2.0
│ 👑 *Owner:* MR EPHRAIM OFC
│ 📞 *Main:* 2347072956206
│ 📞 *Backup:* 2348108717744
╰───◐
✅ *Active & Stable*

${settings.footer}
  `;

  await sock.sendMessage(m.key.remoteJid, { text: text, edit: msg.key }, { quoted: m });
}
}
