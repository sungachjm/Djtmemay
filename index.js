const { Client, GatewayIntentBits, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
require('./keep_alive.js');

// Khởi tạo biến Loader toàn cục để tránh lỗi "Loader is not defined" ở các tệp lệnh
global.Loader = {
  require: (relPath) => require(path.join(__dirname, relPath))
};

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

// Tự động quét và nạp toàn bộ các lệnh trong thư mục commands
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    try {
      const commandModule = require(path.join(commandsPath, file));
      if (typeof commandModule === 'function') {
        commandModule(client);
      }
      console.log(`[LOADED] Command: ${file}`);
    } catch (err) {
      console.error(`[ERROR] Không thể nạp file ${file}:`, err.message);
    }
  }
}

client.once(Events.ClientReady, () => {
  console.log(`Bot đã online thành công với tên: ${client.user.tag}`);
});

client.login(process.env.TOKEN_BOT);

module.exports = client;
