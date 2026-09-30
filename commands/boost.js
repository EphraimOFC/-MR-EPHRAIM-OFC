module.exports = {
name: "boost",
execute: async (sock, m, args, settings) => {
const txt = `🚀 *E TECH OFC BOOST SERVICES* 🚀

We boost WhatsApp Channels Fast & Real!

*SERVICES:*
▢ Channel Followers (Real & Active)
▢ Post Reactions ❤️🔥😂
▢ Post Views 👀
▢ Channel Shares

*Available Packages:*
• 500 Followers
• 1K Followers
• 5K Followers
• 10K Followers

And same for Reactions.

*How to order?*
Just send your channel link and the package you want.

*DM Owner to order 👇*
Main: https://wa.me/2347072956206?text=Hi_I_want_to_boost_my_channel
Backup: https://wa.me/2348108717744?text=Hi_I_want_to_boost_my_channel

> ${settings.footer}`;
await sock.sendMessage(m.chat, { text: txt, 
contextInfo: {
  externalAdReply: {
    title: "E TECH OFC - Channel Boost",
    body: "Fast & Reliable Service",
    thumbnailUrl: settings.menuImage,
    sourceUrl: settings.channelLink,
    mediaType: 1
  }
}
}, {quoted: m});
}
}
