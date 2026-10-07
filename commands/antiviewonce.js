module.exports = {
  name: "antiviewonce",
  alias: ["aviewonce"],
  execute: async (sock, m, args) => {
    if(!global.antiviewonce) global.antiviewonce = true;
    const action = String(args[0] || "").toLowerCase();

    if(action === "on"){
      global.antiviewonce = true;
      return sock.sendMessage(m.chat,{
        text:"╭─〔 👁️ ANTI-VIEWONCE 〕─╮\n│ 🟢 Status: *ACTIVE*\n│\n│ View-once images, videos and\n│ voice notes will be recovered\n│ and delivered normally.\n╰────────────────────╯"
      },{quoted:m});
    }

    if(action === "off"){
      global.antiviewonce = false;
      return sock.sendMessage(m.chat,{
        text:"╭─〔 👁️ ANTI-VIEWONCE 〕─╮\n│ 🔴 Status: *DISABLED*\n│\n│ View-once recovery is turned off.\n╰────────────────────╯"
      },{quoted:m});
    }

    return sock.sendMessage(m.chat,{
      text:`╭─〔 👁️ ANTI-VIEWONCE 〕─╮
│ Status: *${global.antiviewonce?"ACTIVE 🟢":"DISABLED 🔴"}*
│
│ .antiviewonce on
│ .antiviewonce off
╰────────────────────╯`
    },{quoted:m});
  }
};
