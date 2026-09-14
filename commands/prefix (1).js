const fs = require("fs");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(client.prefix)) return;

    const args = message.content.slice(client.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    const ownerOnly = ["prefix"];

    if (ownerOnly.includes(command)) {
      if (message.author.id !== process.env.ID_OWNER) return;
    }

    if (command === "prefix") {
      const newPrefix = args[0];
      if (!newPrefix) return;
      client.prefix = newPrefix;
      fs.writeFileSync("./prefix.json", JSON.stringify({ prefix: newPrefix }), "utf8");
      message.reply(`Prefix đã đổi thành: ${newPrefix}`);
    }
  });
};