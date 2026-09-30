let isEnabled = true; // ON by default

module.exports = {
  name: "antiviewonce",
  execute: async (sock, m, args, settings) => {
    const text = args[0]?.toLowerCase();
    if (text === "on") {
      isEnabled = true;
      global.antiviewonce = true;
      return m.reply("✅ *Anti-ViewOnce ON*\nBot go now open all View Once.");
    } else if (text === "off") {
      isEnabled = false;
      global.antiviewonce = false;
      return m.reply("❌ *Anti-ViewOnce OFF*");
    } else {
      return m.reply(`*Anti-ViewOnce:* ${global.antiviewonce? "ON ✅" : "OFF ❌"}\n\nUse:\n.antiviewonce on\n.antiviewonce off\n\n> ${settings.footer}`);
    }
  }
};

// For index.js to check
module.exports.isEnabled = () => global.antiviewonce!== false;
