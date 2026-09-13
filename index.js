const {
  Client,
  GatewayIntentBits,
  Collection,
  Events
} = require("discord.js");

const fs = require("fs");
const path = require("path");
require("dotenv").config();

// Web keep-alive nếu file tồn tại
const keepAlive = path.join(__dirname, "keep_alive.js");
if (fs.existsSync(keepAlive)) {
  try {
    require(keepAlive);
    console.log("[SYSTEM] keep_alive.js loaded.");
  } catch (err) {
    console.error("[KEEP_ALIVE ERROR]", err);
  }
}

// =========================
// CHECK ENV
// =========================

if (!process.env.TOKEN_BOT) {
  console.error("[ERROR] Không tìm thấy TOKEN_BOT.");
  process.exit(1);
}

// =========================
// CLIENT
// =========================

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// =========================
// COMMAND SYSTEM
// =========================

client.commands = new Collection();
client.prefix = "!";

const commandsPath = path.join(__dirname, "commands");

if (!fs.existsSync(commandsPath)) {
  console.error("[ERROR] Không tìm thấy thư mục commands!");
  process.exit(1);
}

const commandFiles = fs
  .readdirSync(commandsPath)
  .filter(file => file.endsWith(".js"));

console.log(`[SYSTEM] Tìm thấy ${commandFiles.length} file command.`);

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);

  try {
    const command = require(filePath);

    /*
     * Hỗ trợ nhiều kiểu export:
     *
     * module.exports = {...}
     * module.exports = (client) => {...}
     */

    if (typeof command === "function") {
      // Một số command cũ tự đăng ký event
      try {
        command(client);
        console.log(`[LOAD] ${file}`);
      } catch (err) {
        console.error(`[COMMAND ERROR] ${file}`);
        console.error(err);
      }

      continue;
    }

    if (command && typeof command === "object") {
      const commandName =
        command.name ||
        command.data?.name ||
        file.replace(".js", "").toLowerCase();

      client.commands.set(commandName.toLowerCase(), command);

      console.log(`[LOAD] ${file} -> ${commandName}`);
      continue;
    }

    console.warn(`[SKIP] ${file} không phải command hợp lệ.`);

  } catch (err) {
    console.error(`[LOAD ERROR] ${file}`);
    console.error(err);
  }
}

// =========================
// PREFIX COMMAND
// =========================

client.on(Events.MessageCreate, async message => {
  try {
    if (message.author.bot) return;

    const prefix = client.prefix || "!";

    if (!message.content.startsWith(prefix)) return;

    const args = message.content
      .slice(prefix.length)
      .trim()
      .split(/\s+/);

    const commandName = args.shift()?.toLowerCase();

    if (!commandName) return;

    const command = client.commands.get(commandName);

    if (!command) return;

    // Hỗ trợ execute(message, args, client)
    if (typeof command.execute === "function") {
      await command.execute(message, args, client);
      return;
    }

    // Hỗ trợ run(message, args, client)
    if (typeof command.run === "function") {
      await command.run(message, args, client);
      return;
    }

  } catch (error) {
    console.error("[MESSAGE COMMAND ERROR]", error);

    try {
      if (!message.replied) {
        await message.reply("❌ Đã xảy ra lỗi khi thực hiện lệnh.");
      }
    } catch {}
  }
});

// =========================
// SLASH COMMAND
// =========================

client.on(Events.InteractionCreate, async interaction => {
  try {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(
      interaction.commandName.toLowerCase()
    );

    if (!command) {
      return interaction.reply({
        content: "❌ Không tìm thấy lệnh này.",
        ephemeral: true
      });
    }

    if (typeof command.execute === "function") {
      await command.execute(interaction, client);
      return;
    }

    if (typeof command.run === "function") {
      await command.run(interaction, client);
      return;
    }

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({
        content: "❌ Command chưa có hàm execute/run.",
        ephemeral: true
      });
    }

  } catch (error) {
    console.error("[SLASH COMMAND ERROR]", error);

    try {
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "❌ Đã xảy ra lỗi khi thực hiện lệnh.",
          ephemeral: true
        });
      } else {
        await interaction.reply({
          content: "❌ Đã xảy ra lỗi khi thực hiện lệnh.",
          ephemeral: true
        });
      }
    } catch {}
  }
});

// =========================
// READY
// =========================

client.once(Events.ClientReady, readyClient => {
  console.log("=================================");
  console.log(`✅ BOT ONLINE: ${readyClient.user.tag}`);
  console.log(`📦 COMMANDS: ${client.commands.size}`);
  console.log(`🏠 SERVERS: ${readyClient.guilds.cache.size}`);
  console.log(`⚡ PING: ${readyClient.ws.ping}ms`);
  console.log("=================================");
});

// =========================
// ERROR HANDLING
// =========================

client.on(Events.Error, error => {
  console.error("[DISCORD CLIENT ERROR]", error);
});

process.on("unhandledRejection", error => {
  console.error("[UNHANDLED REJECTION]", error);
});

process.on("uncaughtException", error => {
  console.error("[UNCAUGHT EXCEPTION]", error);
});

// =========================
// LOGIN
// =========================

client.login(process.env.TOKEN_BOT)
  .then(() => {
    console.log("[SYSTEM] Đang kết nối Discord...");
  })
  .catch(error => {
    console.error("[LOGIN ERROR]", error);
    process.exit(1);
  });

module.exports = client;
