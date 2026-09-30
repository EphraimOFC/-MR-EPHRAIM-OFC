const axios = require('axios');
module.exports = { name: "insta", execute: async (sock, m, args, s) => {
if(!args[0]) return sock.sendMessage(m.chat,{text:"❌ Insta link?"},{quoted:m});
let {data} = await axios.get(`https://api.davidcyriltech.my.id/download/instagram?url=${args[0]}`);
for(let u of data.result.downloadUrl){
await sock.sendMessage(m.chat,{video:{url:u}, caption:`> ${s.footer}`},{quoted:m});
}
}};
