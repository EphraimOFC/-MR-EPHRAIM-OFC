const axios = require('axios');
module.exports = { name: "cinesubz", execute: async (sock, m, args, s) => {
if(!args.length) return sock.sendMessage(m.chat,{text:"❌ Movie name?"},{quoted:m});
let q = args.join(" ");
await sock.sendMessage(m.chat,{text:`🎬 Searching *${q}* on Movie database...\n> ${s.footer}`},{quoted:m});
// You can connect your own API here
let {data} = await axios.get(`https://api.davidcyriltech.my.id/search/movie?query=${q}`).catch(()=>({data:{}}));
await sock.sendMessage(m.chat,{text:`✅ Found: ${q}\nLink: Coming soon - Add your CineSubz API\n> ${s.footer}`},{quoted:m});
}};
