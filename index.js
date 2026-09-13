const { Client, GatewayIntentBits, Events, REST, Routes, SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
require('./keep_alive.js');

// Khai báo Loader toàn cục để các file trong commands không bị lỗi ReferenceError
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
const slashCommandsData = [];

// Quét sạch toàn bộ các tệp .js nằm trong thư mục commands
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    try {
      const commandName = file.replace('.js', '').toLowerCase();
      const commandModule = require(path.join(commandsPath, file));

      client.commands.set(commandName, commandModule);

      // Tạo cấu trúc Slash Command cho từng file lệnh trong thư mục
      const slashCmd = new SlashCommandBuilder()
        .setName(commandName)
        .setDescription(`Lệnh ${commandName}`);

      slashCommandsData.push(slashCmd.toJSON());
    } catch (err) {
      // Bỏ qua các file bị lỗi cấu trúc riêng để không làm ngắt quá trình nạp
    }
  }
}

client.once(Events.ClientReady, async () => {
  console.log(`Bot đã online: ${client.user.tag}`);

  // Đăng ký toàn bộ danh sách lệnh lên hệ thống Discord
  const rest = new REST({ version: '10' }).setToken(process.env.TOKEN_BOT);
  try {
    console.log(`Đang đồng bộ ${slashCommandsData.length} lệnh lên Discord...`);
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: slashCommandsData }
    );
    console.log('Đã nạp thành công toàn bộ danh sách lệnh!');
  } catch (error) {
    console.error('Lỗi khi nạp danh sách lệnh:', error);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    if (interaction.commandName === 'ping') {
      return await interaction.reply(`Ping: ${client.ws.ping}ms`);
    }
    await interaction.reply({ content: `Thực thi lệnh /${interaction.commandName}`, ephemeral: true });
  } catch (error) {
    console.error(error);
  }
});

client.login(process.env.TOKEN_BOT);

module.exports = client;
