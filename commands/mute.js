module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.author.id !== process.env.ID_OWNER) return;
    if (!message.content.startsWith(client.prefix)) return;

    const args = message.content.slice(client.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "mute") {
      const input = args[0];
      if (!input) return;

      const id = input.replace(/[<@!>]/g, "");
      const member = await message.guild.members.fetch(id).catch(() => null);
      if (!member) return;

      let ms = 0;
      for (const part of args.slice(1)) {
        const match = part.match(/^(\d+)([smhd])$/i);
        if (!match) continue;
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();
        if (unit === "s") ms += value * 1000;
        else if (unit === "m") ms += value * 60000;
        else if (unit === "h") ms += value * 3600000;
        else if (unit === "d") ms += value * 86400000;
      }
      if (ms <= 0) return;

      const botMember = message.guild.members.me;

      if (
        !botMember.permissions.has("ModerateMembers") ||
        botMember.roles.highest.position <= member.roles.highest.position ||
        member.id === message.guild.ownerId
      ) {
        const reply = await message.reply("I don't have enough authority.").catch(() => null);
        if (reply) setTimeout(() => reply.delete().catch(() => {}), 6000);
        return;
      }

      await member.timeout(ms).catch(async () => {
        const reply = await message.reply("I don't have enough authority.").catch(() => null);
        if (reply) setTimeout(() => reply.delete().catch(() => {}), 6000);
      });

      return;
    }
  });
};