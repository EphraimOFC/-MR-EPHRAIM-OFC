const axios = require('axios');
module.exports = { name: "img", execute: async (sock, m, args, s) => {
if(!args.length) return sock.sendMessage(m.chat,{text:"❌ Image name?"},{quoted:m});
let {data} = await axios.get(`https://api.davidcyriltech.my.id/search/gimage?text=${args.join(" ")}`);
await sock.sendMessage(m.chat,{image:{url:data.result[0]}, caption:`> ${s.footer}`},{quoted:m});
}};
