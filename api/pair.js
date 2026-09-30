const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const fs = require('fs');
const pino = require('pino');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: "POST only" });
  
  const { number } = req.body;
  if (!number) return res.status(400).json({ error: "Number required" });
  
  const cleanNum = number.replace(/[^0-9]/g, '');
  
  const tempDir = `/tmp/${Date.now()}_${cleanNum}`;
  try { fs.mkdirSync(tempDir, { recursive: true }); } catch {}
  
  try {
    const { state, saveCreds } = await useMultiFileAuthState(tempDir);
    
    const sock = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: 'silent' }),
      browser: ["E TECH OFC", "Chrome", "1.0.0"]
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    await delay(3000);
    
    let code = await sock.requestPairingCode(cleanNum);
    code = code?.match(/.{1,4}/g)?.join("-") || code;
    
    // Don't delete immediately, keep for 30 sec
    setTimeout(() => {
      try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
    }, 30000);
    
    return res.status(200).json({ code: code, message: "Check WhatsApp for code" });
    
  } catch (e) {
    try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch {}
    console.log("Pair error:", e);
    return res.status(500).json({ error: e.message || "Failed to get code" });
  }
};
