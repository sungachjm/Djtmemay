const {
  Client,
  GatewayIntentBits,
  Collection,
  Events
} = require("discord.js");

const fs = require("fs");
const path = require("path");
require("dotenv").config();

const keepAlive = path.join(__dirname, "keep_alive.js");
if (fs.existsSync(keepAlive)) {
  try {
    require(keepAlive);
    console.log("[SYSTEM] keep_alive.js loaded.");
  } catch (err) {
    console.error("[KEEP_ALIVE ERROR]", err);
  }
}

if (!process.env.TOKEN_BOT) {
  console.error("[ERROR] Không tìm thấy TOKEN_BOT.");
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();
client.prefix = "!";

if (fs.existsSync("./prefix.json")) {
  const data = JSON.parse(fs.readFileSync("./prefix.json", "utf8"));
  client.prefix = data.prefix || "!";
}

const commandModules = [
  "./commands/prefix.js",
  "./commands/role.js",
  "./commands/purge.js",
  "./commands/AFK.js",
  "./commands/avatar.js",
  "./commands/ping.js",
  "./commands/kick.js",
  "./commands/ban.js",
  "./commands/unban.js",
  "./commands/mute.js",
  "./commands/unmute.js",
  "./commands/automod.js",
  "./commands/ccspam.js",
  "./commands/ccimage.js",
  "./commands/addmod.js",
  "./commands/addrank.js",
  "./commands/addrole.js",
  "./commands/announce.js",
  "./commands/autopurge.js",
  "./commands/blacklist.js",
  "./commands/botlist.js",
  "./commands/clean.js",
  "./commands/clearWarnings.js",
  "./commands/deafen.js",
  "./commands/delmod.js",
  "./commands/delrank.js",
  "./commands/delrole.js",
  "./commands/diagnose.js",
  "./commands/discrim.js",
  "./commands/flipcoin.js",
  "./commands/google.js",
  "./commands/ignoreChannel.js",
  "./commands/ignoreUser.js",
  "./commands/ignored.js",
  "./commands/info.js",
  "./commands/inviteInfo.js",
  "./commands/listmods.js",
  "./commands/membercount.js",
  "./commands/members.js",
  "./commands/mentionable.js",
  "./commands/modlogs.js",
  "./commands/modules.js",
  "./commands/nick.js",
  "./commands/play.js",
  "./commands/queue.js",
  "./commands/randomcolor.js",
  "./commands/rank.js",
  "./commands/reason.js",
  "./commands/remindme.js",
  "./commands/rolecolor.js",
  "./commands/roleinfo.js",
  "./commands/rolename.js",
  "./commands/rolepersist.js",
  "./commands/roles.js",
  "./commands/roll.js",
  "./commands/rps.js",
  "./commands/serverinfo.js",
  "./commands/serverinvite.js",
  "./commands/setnick.js",
  "./commands/skip.js",
  "./commands/softban.js",
  "./commands/stats.js",
  "./commands/stop.js",
  "./commands/tag.js",
  "./commands/tags.js",
  "./commands/togglecommand.js",
  "./commands/togglemodule.js",
  "./commands/undeafen.js",
  "./commands/uptime.js",
  "./commands/volume.js",
  "./commands/warn.js",
  "./commands/warnings.js",
  "./commands/whitelist.js",
  "./commands/whois.js",
  "./commands/youtube.js"

];

for (const mod of commandModules) {
  const filePath = path.join(__dirname, mod);
  if (!fs.existsSync(filePath)) continue;

  try {
    const command = require(filePath);
    if (typeof command === "function") {
      command(client);
      console.log(`[LOAD] ${mod}`);
    }
  } catch (err) {
    console.error(`[LOAD ERROR] ${mod}`);
    console.error(err);
  }
}

client.once(Events.ClientReady, readyClient => {
  console.log("=================================");
  console.log(`✅ BOT ONLINE: ${readyClient.user.tag}`);
  console.log(`🏠 SERVERS: ${readyClient.guilds.cache.size}`);
  console.log(`⚡ PING: ${readyClient.ws.ping}ms`);
  console.log("=================================");
});

client.on(Events.Error, error => {
  console.error("[DISCORD CLIENT ERROR]", error);
});

process.on("unhandledRejection", error => {
  console.error("[UNHANDLED REJECTION]", error);
});

process.on("uncaughtException", error => {
  console.error("[UNCAUGHT EXCEPTION]", error);
});

client.login(process.env.TOKEN_BOT)
  .then(() => {
    console.log("[SYSTEM] Đang kết nối Discord...");
  })
  .catch(error => {
    console.error("[LOGIN ERROR]", error);
    process.exit(1);
  });

module.exports = client;
