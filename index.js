const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const P = require('pino');
const settings = require('./settings');
const axios = require('axios');
const yts = require('yt-search');

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(settings.sessionName);
  const sock = makeWASocket({
    logger: P({ level: 'silent' }),
    auth: state,
    printQRInTerminal:false,
    browser: [settings.botName, "Chrome", "1.0"]
  });if (!state.creds.registered) {
    const phoneNumber = "2347072956206";
    setTimeout(async () => {
      let code = await sock.requestPairingCode(phoneNumber);
      console.log("YOUR PAIR CODE: " + code);
    }, 3000);
  }

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode!== DisconnectReason.loggedOut;
      if (shouldReconnect) startBot();
    } else if (connection === 'open') {
      console.log(`✅ ${settings.botName} Connected!`);
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    try {
      const m = messages[0];
      if (!m.message || m.key.fromMe) return;
      const from = m.key.remoteJid;
      const pushName = m.pushName || "User";
      const body = m.message.conversation || m.message.extendedTextMessage?.text || m.message.imageMessage?.caption || "";
      if (!body.startsWith(settings.prefix)) return;
      const args = body.slice(settings.prefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();
      const q = args.join(" ");

      if (command === 'menu') {
        const menu = `
╔═══ *『 ${settings.botName} 』* ═══╗
║ 🔴 *RED QUEEN EDITION* 🔴
╚═══════════════════════╝
*Hello, ${pushName}!*
┏━━━━━━━━━━━━━━━┓
┃ *BOT:* ${settings.botName}
┃ *DEV:* ${settings.ownerName}
┃ *PREFIX:* ${settings.prefix}
┗━━━━━━━━━━━━━━━┛
┏━━ *MAIN* ━━┓
┃ ✦ ${settings.prefix}menu
┃ ✦ ${settings.prefix}ping
┃ ✦ ${settings.prefix}alive
┗━━━━━━━━━┛
┏━━ *DOWNLOADER* ━━┓
┃ ✦ ${settings.prefix}song <name> - Audio + Document
┃ ✦ ${settings.prefix}play <name>
┗━━━━━━━━━━━━━━┛
┏━━━━━━━━━━━━━━┓
┃ Powered By ${settings.ownerName} 🔴
┗━━━━━━━━━━━━━━┛
`;
        await sock.sendMessage(from, { text: menu }, { quoted: m });
      }
      if (command === 'ping') {
        await sock.sendMessage(from, { text: `🔴 Pong! ${Date.now()%100}ms\n${settings.botName}` }, { quoted: m });
      }
      if (command === 'alive' || command === 'owner') {
        await sock.sendMessage(from, { text: `🔴 *${settings.botName}* Alive!\nDev: ${settings.ownerName}` }, { quoted: m });
      }
      if (command === 'song' || command === 'play') {
        if (!q) return await sock.sendMessage(from, { text: `🔴 Example: ${settings.prefix}song Calm Down` }, { quoted: m });
        await sock.sendMessage(from, { text: `🔴 Searching... ${q}` }, { quoted: m });
        try {
          const search = await yts(q);
          const video = search.videos[0];
          if (!video) return await sock.sendMessage(from, { text: `❌ Not found` }, { quoted: m });
          const apiUrl = `https://api.davidcyriltech.my.id/download/ytmp3?url=${video.url}`;
          const res = await axios.get(apiUrl);
          const dlUrl = res.data.result?.downloadUrl || res.data.download_url || res.data.url;
          if (!dlUrl) throw new Error("No url");
          let info = `╔═══ *FOUND* ═══╗\n║ Title: ${video.title}\n║ Duration: ${video.timestamp}\n╚════════════╝\nSending Audio + Document...`;
          await sock.sendMessage(from, { text: info }, { quoted: m });
          await sock.sendMessage(from, { audio: { url: dlUrl }, mimetype: 'audio/mpeg', fileName: `${video.title}.mp3` }, { quoted: m });
          await sock.sendMessage(from, { document: { url: dlUrl }, mimetype: 'audio/mpeg', fileName: `${video.title}.mp3`, caption: `🔴 ${video.title}\nPowered by ${settings.botName}` }, { quoted: m });
        } catch (err) {
          await sock.sendMessage(from, { text: `❌ Failed: ${err.message}` }, { quoted: m });
        }
      }
    } catch (e) { console.log(e); }
  });
}
startBot();
