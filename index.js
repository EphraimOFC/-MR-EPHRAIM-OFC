const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const settings = require('./settings');

async function startBot() {
const { state, saveCreds } = await useMultiFileAuthState(settings.sessionName);
const sock = makeWASocket({ auth: state, printQRInTerminal: true });

// LOAD COMMANDS
const commands = new Map();
const cmdPath = path.join(__dirname, 'commands');
if(fs.existsSync(cmdPath)){
fs.readdirSync(cmdPath).forEach(file => {
if(file.endsWith('.js')){
const cmd = require(`./commands/${file}`);
commands.set(cmd.name, cmd);
}
});
console.log(`Loaded ${commands.size} commands`);
}

sock.ev.on('creds.update', saveCreds);

sock.ev.on('messages.upsert', async ({ messages }) => {
const m = messages[0];
if(!m.message) return;
const body = m.message.conversation || m.message.extendedTextMessage?.text || "";
if(!body.startsWith(settings.prefix)) return;

const args = body.slice(settings.prefix.length).trim().split(/ +/);
const cmdName = args.shift().toLowerCase();

if(commands.has(cmdName)){
try{
await commands.get(cmdName).execute(sock, m, args, settings);
}catch(e){ console.log(e); }
}
});
}

startBot();
