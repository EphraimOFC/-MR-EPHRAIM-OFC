const ytSearch = require('yt-search');
module.exports = {
name: "video",
execute: async (sock, m, args, settings) => {
if(!args.length) return sock.sendMessage(m.chat, {text:"❌ Use:.video <name>"}, {quoted:m});
let q = args.join(" ");
let search = await ytSearch(q);
let video = search.videos[0];
if(!video) return sock.sendMessage(m.chat, {text:"❌ Not found"}, {quoted:m});

let cap = `📹 *E TECH VIDEO DOWNLOADER*\n\n*Title:* ${video.title}\n*Duration:* ${video.timestamp}\n*Views:* ${video.views}\n\n> ${settings.footer}`;

let btns = [
{buttonId: `vid_${video.url}`, buttonText: {displayText: "📹 VIDEO"}, type: 1},
{buttonId: `viddoc_${video.url}`, buttonText: {displayText: "📁 DOCUMENT"}, type: 1}
];

await sock.sendMessage(m.chat, {
image: {url: video.thumbnail},
caption: cap,
buttons: btns,
headerType: 4
}, {quoted:m});
}
}
