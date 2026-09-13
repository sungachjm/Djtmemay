module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.author.id !== process.env.ID_OWNER) return;
    if (!message.content.startsWith(client.prefix)) return;

    const args = message.content.slice(client.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "ban") {
      const input = args[0];
      if (!input) return;

      const id = input.replace(/[<@!>]/g, "");
      const member = await message.guild.members.fetch(id).catch(() => null);
      if (!member) return;

      const botMember = message.guild.members.me;

      if (
        !botMember.permissions.has("BanMembers") ||
        botMember.roles.highest.position <= member.roles.highest.position ||
        member.id === message.guild.ownerId
      ) {
        const reply = await message.reply("I don't have enough authority.").catch(() => null);
        if (reply) setTimeout(() => reply.delete().catch(() => {}), 6000);
        return;
      }

      await member.ban().catch(async () => {
        const reply = await message.reply("I don't have enough authority.").catch(() => null);
        if (reply) setTimeout(() => reply.delete().catch(() => {}), 6000);
      });

      return;
    }
  });
};