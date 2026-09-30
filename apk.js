const axios = require('axios');
module.exports = { name: "apk", execute: async (sock, m, args, s) => {
if(!args[0]) return sock.sendMessage(m.chat,{text:"❌ Apk name?"},{quoted:m});
let {data} = await axios.get(`https://api.davidcyriltech.my.id/search/apk?text=${args.join(" ")}`);
let app = data.result[0];
await sock.sendMessage(m.chat,{document:{url:app.downloadUrl}, fileName:`${app.name}.apk`, mimetype:"application/vnd.android.package-archive", caption:`> ${s.footer}`},{quoted:m});
}};
