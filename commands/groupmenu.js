module.exports = {
name: "gmenu",
aliases: ["groupmenu","group","gm"],
async execute(sock, m, args, settings){
  let userName = m.pushName || "User"
  let txt = `*👥⃝⃘̉̉̉━⋆─⋆──❂*
*┊ ┊ ┊ ┊ ┊*
*┊ ┊ ✫ ˚㋛ ⋆｡ ❀*
*┊ ☠︎︎*
*✧  ${userName}*
*╰────────────────❂*
 *┏━━━━━━━━━━━❥❥❥*
 *┃* \`𝗚𝗥𝗢𝗨𝗣 𝗠𝗘𝗡𝗨\`
 *┗━━━━━━━━━━━❥❥❥*

* *58 commands — everything you need to know*
* *💡 _.help <command>_ shows just one*

*「 𝗠𝗘𝗠𝗕𝗘𝗥𝗦 」*

*┏━━━━━━❥❥❥*
*┃* \`.add\`
*┗━━━━━━❥❥❥*
* Also: .invite
* Add a member — number in any format, or reply to a contact card
* .add 0771234567 → add one person
* .add 94771234567, 0711234567 → several at once (max 20)
* Reply to a contact card + .add → adds that contact
* Everyone · inside groups
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* \`.kick\`
*┗━━━━━━❥❥❥*
* Also: .remove .out
* Remove a member — @mention / number / reply
* .kick @user → remove a member
* .kick 0771234567 → by number · or reply + .kick
* Max 30 per command. Never removes admins/owner
* Group admins · bot must be admin
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* \`.promote\`
*┗━━━━━━❥❥❥*
* Also: .makeadmin
* Make admin — @mention / number / reply
* .promote @user → make them admin
* Max 30 per command
* Group admins · bot must be admin
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* \`.demote\`
*┗━━━━━━❥❥❥*
* Also: .unadmin
* Remove admin rights
* .demote @user
* Group admins · bot must be admin
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* \`.warn\`
*┗━━━━━━❥❥❥*
* Warn a member (auto remove at limit)
* .warn @user spamming
* Reply + .warn
* Warn limit default 3 → removed auto. Owner: .ganti limit 5
* Group admins · inside groups
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* \`.warns\`
*┗━━━━━━❥❥❥*
* Also: .warnlist
* See warnings
* .warns → everyone · .warns @user → one
* Group admins
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* \`.resetwarn\`
*┗━━━━━━❥❥❥*
* Also: .unwarn .clearwarn
* Clear warnings
* .resetwarn @user · .resetwarn all
* Group admins
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* \`.del\`
*┗━━━━━━❥❥❥*
* Also: .delete
* Delete a message — reply to it
* Reply + .del → deletes for everyone
* Group admins · bot must be admin
 *━━━━━━━━━━❥❥❥*

*「 𝗧𝗔𝗚𝗚𝗜𝗡𝗚 」*

*┏━━━━━━❥❥❥*
*┃* \`.tagall\`
*┗━━━━━━❥❥❥*
* Also: .everyone
* Mention everyone
* .tagall Hello! → mentions all
* Reply to photo/video + .tagall → with media
* Once per 8 sec
* Group admins
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* \`.tagadmins\`
*┗━━━━━━❥❥❥*
* Also: .admins
* Mention all admins
* .tagadmins Need help!
* Group admins
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* \`.hidetag\`
*┗━━━━━━❥❥❥*
* Also: .htag
* Tag everyone without showing list
* .hidetag Meeting at 8
* Once per 8 sec
* Group admins
 *━━━━━━━━━━❥❥❥*

*「 ℹ 𝗜𝗡𝗙𝗢 & 𝗟𝗜𝗡𝗞𝗦 」*

*┏━━━━━━❥❥❥*
*┃* \`.ginfo\`
*┗━━━━━━❥❥❥*
* Group info
* .ginfo → name, members, admins, owner, settings
* Everyone
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* \`.glink\`
*┗━━━━━━❥❥❥*
* Get invite link
* .glink → shows link
* Group admins · bot must be admin
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* \`.grlink\` / \`.gnlink\`
*┗━━━━━━❥❥❥*
* Reset link
* .grlink → cancels old link
* .gnlink → new link sent
* Group admins · bot must be admin
 *━━━━━━━━━━❥❥❥*

*「 𝗚𝗥𝗢𝗨𝗣 𝗦𝗘𝗧𝗧𝗜𝗡𝗚𝗦 」*

*┏━━━━━━❥❥❥*
*┃* \`.gname\` \`.gdec\` \`.gdp\` \`.grdp\`
*┗━━━━━━❥❥❥*
* .gname New name → change name
* .gdec New desc → change description · .gdec clear
* Reply photo + .gdp → set group photo
* .grdp → remove photo
* Group admins · bot must be admin
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* \`.close\` \`.open\`
*┗━━━━━━❥❥❥*
* .close → only admins can send
* .close 30m → auto reopens after 30m
* .open → everyone can send
* Time: m=minutes h=hours d=days
* Group admins · bot must be admin
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* \`.lock\` \`.unlock\`
*┗━━━━━━❥❥❥*
* .lock → only admins can edit info
* .unlock → everyone can edit
* Group admins · bot must be admin
 *━━━━━━━━━━❥❥❥*

*┏━━━━━━❥❥❥*
*┃* \`.addadmin\` \`.addmember\`
*┗━━━━━━❥❥❥*
* .addadmin → only admins can add
* .addmember → everyone can add
* Group admins · bot must be admin
 *━━━━━━━━━━❥❥❥*

*「 𝗣𝗥𝗢𝗧𝗘𝗖𝗧𝗜𝗢𝗡 」*

*┏━━━━━━❥❥❥*
*┃* \`.ganti\` \`.antispam\` \`.block\` \`.antibot\`
*┗━━━━━━❥❥❥*
* .ganti → menu: link/bad/bot/mention
* .ganti link on · .ganti all off
* .antispam on · .antispam 6/8
* .block sticker/image/forward/media on/off
* .antibot on/off → deletes other bots + warns 0/5
* Group admins
 *━━━━━━━━━━❥❥❥*

*「 𝗪𝗘𝗟𝗖𝗢𝗠𝗘 & 𝗥𝗨𝗟𝗘𝗦 」*

*┏━━━━━━❥❥❥*
*┃* \`.welcome\` \`.goodbye\` \`.setrules\` \`.rules\`
*┗━━━━━━❥❥❥*
* .welcome on/off · .welcome Hi {user}!
* .goodbye on/off
* .setrules 1. Be kind
* .rules → show · .delrules → delete
* Group admins
 *━━━━━━━━━━❥❥❥*

*「 𝗔𝗖𝗧𝗜𝗩𝗜𝗧𝗬 」*

*┏━━━━━━❥❥❥*
*┃* \`.activity\` \`.top\` \`.inactive\`
*┗━━━━━━❥❥❥*
* .activity on/off/reset
* .top → 10 most active · .top 20
* .inactive → no msg 30d
* Everyone
 *━━━━━━━━━━❥❥❥*

*「 𝗢𝗪𝗡𝗘𝗥 𝗢𝗡𝗟𝗬 」*

*┏━━━━━━❥❥❥*
*┃* \`.gsave\` \`.join\` \`.left\` \`.ban\` \`.unban\`
*┗━━━━━━❥❥❥*
* .gsave → .vcf all members
* .join link → bot joins
* .left → bot leaves
* .ban @user/group · .unban
* Owner only
 *━━━━━━━━━━❥❥❥*

*${settings.footer}*`

  await sock.sendMessage(m.chat, { text: txt }, { quoted: m })
}
}
