module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.author.id !== process.env.ID_OWNER) return;
    if (!message.content.startsWith(client.prefix)) return;

    const args = message.content.slice(client.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "role") {
      const roleInput = args[0];
      const userInput = args[1];
      if (!roleInput || !userInput) return;

      const roleId = roleInput.replace(/[<@&>]/g, "");
      const userId = userInput.replace(/[<@!>]/g, "");

      const role = message.guild.roles.cache.get(roleId);
      if (!role) return;

      const member = await message.guild.members.fetch(userId).catch(() => null);
      if (!member) return;

      await member.roles.add(role).catch(() => {});
      return;
    }

    if (command === "addrole") {
      const name = args.join(" ");
      if (!name) return;
      await message.guild.roles.create({ name }).catch(() => {});
      return;
    }

    if (command === "delrole") {
      const roleInput = args[0];
      if (!roleInput) return;

      const roleId = roleInput.replace(/[<@&>]/g, "");
      const role = message.guild.roles.cache.get(roleId);
      if (!role) return;

      await role.delete().catch(() => {});
      return;
    }
  });
};