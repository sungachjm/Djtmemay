const { EmbedBuilder } = require("discord.js");

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (!message.content.startsWith(client.prefix)) return;

    const args = message.content.slice(client.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "av" || command === "avatar") {
      let target = message.author;

      if (args[0]) {
        const id = args[0].replace(/[<@!>]/g, "");
        const member = await message.guild.members.fetch(id).catch(() => null);
        if (member) target = member.user;
      } else if (message.mentions.users.size > 0) {
        target = message.mentions.users.first();
      }

      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setImage(target.displayAvatarURL({ size: 4096, dynamic: true }));

      await message.reply({ embeds: [embed] }).catch(() => {});
      return;
    }
  });
};