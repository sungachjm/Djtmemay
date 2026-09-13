const { Client, GatewayIntentBits, Events } = require('discord.js');
const fs = require('fs');
require('dotenv').config();
require('./keep_alive.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Map();
client.prefix = "!";

if (fs.existsSync("./prefix.json")) {
  const data = JSON.parse(fs.readFileSync("./prefix.json", "utf8"));
  client.prefix = data.prefix || "!";
}

// Đã xóa dòng gọi file prefix.js bị thiếu ở đây
require("./commands/role.js")(client);
require("./commands/purge.js")(client);
require("./commands/AFK.js")(client);
require("./commands/avatar.js")(client);
require("./commands/ping.js")(client);
require("./commands/kick.js")(client);
require("./commands/ban.js")(client);
require("./commands/unban.js")(client);
require("./commands/mute.js")(client);
require("./commands/unmute.js")(client);
require("./commands/automod.js")(client);
require("./commands/ccspam.js")(client);
require("./commands/ccimage.js")(client);

client.once(Events.ClientReady, () => {});

client.login(process.env.TOKEN_BOT);

module.exports = client;
