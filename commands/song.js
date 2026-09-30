const ytSearch = require('yt-search');
const axios = require('axios');
const API_KEY = "chama_api_f42172169b62b947022925d936ac987f";
module.exports = {
name: "song",
execute: async (sock, m, args, settings) => {
if(!args.length) return sock.sendMessage(m.chat, {text:"❌ Use:.song <song name>"}, {quoted:m});
let q = args.join(" ");
let search = await ytSearch(q);
let video = search.videos[0];
if(!video) return sock.sendMessage(m.chat, {text:"❌ Not found"}, {quoted:m});

let cap = `🎧 *E TECH SONG DOWNLOADER*\n\n*Title:* ${video.title}\n*Duration:* ${video.timestamp}\n*Views:* ${video.views}\n*Uploaded:* ${video.ago}\n\n> ${settings.footer}`;

let btns = [
{buttonId: `audio_${video.url}`, buttonText: {displayText: "🎧 AUDIO"}, type: 1},
{buttonId: `doc_${video.url}`, buttonText: {displayText: "📁 DOCUMENT"}, type: 1}
];

await sock.sendMessage(m.chat, {
image: {url: video.thumbnail},
caption: cap,
buttons: btns,
headerType: 4
}, {quoted:m});
}
}
