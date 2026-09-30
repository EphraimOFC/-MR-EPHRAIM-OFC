const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
const fs = require('fs');

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: "POST only" });
  
  const { number } = req.body;
  if (!number) return res.status(400).json({ error: "Number required" });
  
  const cleanNum = number.replace(/[^0-9]/g, '');
  
  try {
    const tempDir = `/tmp/${Date.now()}_${cleanNum}`;
    fs.mkdirSync(tempDir, { recursive: true });
    
    const { state, saveCreds } = await useMultiFileAuthState(tempDir);
    
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: { level: 'silent' },
      browser: ["E TECH OFC", "Chrome", "1.0.0"]
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    await new Promise(r => setTimeout(r, 3000));
    
    let code = await sock.requestPairingCode(cleanNum);
    code = code.match(/.{1,4}/g).join("-");
    
    setTimeout(() => {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
    }, 15000);
    
    return res.status(200).json({ code, number: cleanNum });
    
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
