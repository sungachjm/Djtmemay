const { Client, GatewayIntentBits, Events, REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
require('./keep_alive.js');

// Khởi tạo Loader toàn cục
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

// Quét thư mục commands và tạo danh sách Slash Commands
const commandsPath = path.join(__dirname, 'commands');
const slashCommandsData = [];

if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    try {
      const commandName = file.replace('.js', '').toLowerCase();
      const commandModule = require(path.join(commandsPath, file));
      
      client.commands.set(commandName, commandModule);

      // Đăng ký lệnh dạng Slash Command /
      const slashCmd = new SlashCommandBuilder()
        .setName(commandName)
        .setDescription(`Thực thi lệnh ${commandName}`);

      slashCommandsData.push(slashCmd.toJSON());
      console.log(`[LOADED] Command: ${file}`);
    } catch (err) {
      console.error(`[SKIP] File ${file}:`, err.message);
    }
  }
}

// Đăng ký danh sách lệnh lên Discord API khi Bot sẵn sàng
client.once(Events.ClientReady, async () => {
  console.log(`Bot đã online: ${client.user.tag}`);

  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN_BOT);
  try {
    console.log('Đang đồng bộ danh sách lệnh Slash (/) với Discord...');
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: slashCommandsData }
    );
    console.log('Cập nhật lệnh Slash (/) thành công!');
  } catch (error) {
    console.error('Lỗi khi đăng ký lệnh Slash:', error);
  }
});

// Xử lý sự kiện khi người dùng gõ lệnh Slash (/)
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    if (interaction.commandName === 'ping') {
      return await interaction.reply(`Ping: ${client.ws.ping}ms`);
    }
    await interaction.reply({ content: `Đã nhận lệnh /${interaction.commandName}`, ephemeral: true });
  } catch (error) {
    console.error(error);
  }
});

client.login(process.env.TOKEN_BOT);

module.exports = client;
