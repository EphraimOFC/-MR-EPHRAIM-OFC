module.exports = {
name: "ping",
execute: async (sock, m, args, settings) => {
await sock.sendMessage(m.chat, { text: "Pong! E TECH OFC is active ✅" }, { quoted: m });
}
}
