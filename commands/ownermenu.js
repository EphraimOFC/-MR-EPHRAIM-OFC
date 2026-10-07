module.exports = {
name: "ownermenu",
async execute(sock, m, args, settings) {
let userName = m.pushName || "User"
let fancyName = userName.toUpperCase()

let txt = `
*👑⃝⃘̉̉̉━⋆─⋆──❂*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☠︎︎*
*✧  ${fancyName}𓂃✍︎𝄞*
*╰────────────────❂*
 *┏━━━━━━━━━━━❥❥❥*
 *┃* `𝗢𝗪𝗡𝗘𝗥 𝗠𝗘𝗡𝗨`
 *┗━━━━━━━━━━━❥❥❥*

* *16 commands — everything you need to know*
* *💡 _.help <command>_ shows just one*

*┏━━━━━━❥❥❥*
*┃* `.mode`
*┗━━━━━━❥❥❥*
* Change bot MODE
* .mode → pick the bot mode from a list
* .mode private → only you (owner) can use the bot
* public = everyone · private = owner only · inbox = inbox only · group = groups only · admin = group admins only
* Bot owner only
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* `.forward`
*┗━━━━━━❥❥❥*
* Also: .fwd
* Reply + .forward me, 9477…, group/channel link
* Reply to any message / status + .forward me → sends it to the bot's inbox
* .forward 94771234567 → to numbers
* .forward <group link> → to a group / channel
* Bot owner only
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* `.data`
*┗━━━━━━❥❥❥*
* Also: .storage
* Saved data: usage, limit and clean-up
* .data → how much saved data the bot uses
* .data clean → delete data of groups bot left
* Bot owner only
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* `.setlogo`
*┗━━━━━━❥❥❥*
* Also: .logo
* Set your own logo — just reply to a photo
* Reply to any photo + .setlogo → that photo becomes menu picture
* .setlogo clear → back to default
* Bot owner only
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* `.settings`
*┗━━━━━━❥❥❥*
* Also: .setting .panel .config
* Your control panel — change how bot behaves
* .settings → friendly panel
* Bot owner only
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* `.getdp`
*┗━━━━━━❥❥❥*
* Get anyone's profile picture
* .getdp 0771234567 · reply to someone · mention them
* Bot owner only
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* `.privacy`
*┗━━━━━━❥❥❥*
* View & change your WhatsApp privacy
* .privacy → shows current privacy
* Bot owner only · in inbox
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* `.setsudo`
*┗━━━━━━❥❥❥*
* Add a sudo user
* .setsudo 0771234567
* Bot owner only
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* `.delsudo`
*┗━━━━━━❥❥❥*
* Remove a sudo user
* .delsudo 0771234567
* Bot owner only
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* `.setcvoice`
*┗━━━━━━❥❥❥*
* Set the voice footer of .csong
* Reply to voice note with .setcvoice
* Bot owner only
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* `.setchannel`
*┗━━━━━━❥❥❥*
* Link a channel you own to this bot
* .setchannel <channel link>
* Bot owner only
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* `.mychannels`
*┗━━━━━━❥❥❥*
* Your verified channels
* .mychannels → lists your channels
* Bot owner only
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* `.creact`
*┗━━━━━━❥❥❥*
* Send reactions to a channel post
* .creact <post link>, <emojis>, <time>
* Bot owner only
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* `.addreply`
*┗━━━━━━❥❥❥*
* Also: .setreply .addautoreply
* Teach auto reply
* .addreply hi | Hello! How can I help?
* Bot owner only
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* `.delreply`
*┗━━━━━━❥❥❥*
* Delete an auto-reply
* .delreply hi · .delreply 2 · .delreply all
* Bot owner only
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* `.replies`
*┗━━━━━━❥❥❥*
* Your auto-replies
* .replies → keywords, what each one answers
* Bot owner only
 *━━━━━━━━━━❥❥❥*

👨‍💻 Develop By *ᴍʀ ᴇᴘʜʀᴀɪᴍ ᴏꜰᴄ*
> *© Powered by E TECH OFC™*
`
await sock.sendMessage(m.chat, { text: txt }, { quoted: m })
}
}
