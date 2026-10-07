const pairCommand = require('./pair');

module.exports = {
  name: "bot",
  alias: ["createbot"],
  execute: async (sock, m, args, settings) => {
    const sender = String(m.key.participant || m.key.remoteJid || "").split("@")[0].replace(/[^0-9]/g,"");
    const number = String(args[0] || sender).replace(/[^0-9]/g,"");

    if(number.length < 10 || number.length > 15){
      return sock.sendMessage(m.chat,{
        text:`🤖 *E TECH OFC BOT CREATOR*

Usage:
• .bot 2348012345678
• .pair 2348012345678

The bot now generates the *real 8-character WhatsApp pairing code* directly. The old 6-character request ID has been removed.

🌐 Pairing site:
${settings.pairWebsite}`
      },{quoted:m});
    }

    await sock.sendMessage(m.chat,{
      text:`🤖 *E TECH OFC BOT CREATOR*

📱 Number: *${number}*
🔐 Starting secure pairing...
\n\nYou will receive:
• a real 8-character pairing code
• a QR pairing option
\n\n🌐 Backup pairing site: ${settings.pairWebsite}`
    },{quoted:m});

    return pairCommand.execute(sock,m,[number],settings);
  }
};
