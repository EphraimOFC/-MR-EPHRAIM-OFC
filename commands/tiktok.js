const axios = require('axios');
module.exports = { name: "tiktok", execute: async (sock, m, args, s) => {
if(!args[0]) return sock.sendMessage(m.chat,{text:"❌ Tiktok link?"},{quoted:m});
let {data} = await axios.get(`https://api.davidcyriltech.my.id/download/tiktok?url=${args[0]}`);
await sock.sendMessage(m.chat,{video:{url:data.result.video}, caption:`> ${s.footer}`},{quoted:m});
}};
