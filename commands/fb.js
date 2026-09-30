const axios = require('axios');
module.exports = { name: "fb", execute: async (sock, m, args, s) => {
if(!args[0]) return sock.sendMessage(m.chat,{text:"❌ Link?"},{quoted:m});
let {data} = await axios.get(`https://api.davidcyriltech.my.id/download/fb?url=${args[0]}`);
await sock.sendMessage(m.chat,{video:{url:data.result.downloadUrl}, caption:`> ${s.footer}`},{quoted:m});
}};
