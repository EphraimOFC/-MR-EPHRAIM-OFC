module.exports = {
name: "ss",
execute: async (sock, m, args, settings) => {
const cmd = require('./send.js');
return cmd.execute(sock, m, args, settings);
}
}
