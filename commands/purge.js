module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.author.id !== process.env.ID_OWNER) return;
    if (!message.content.startsWith(client.prefix)) return;

    const args = message.content.slice(client.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "purge") {
      const amount = parseInt(args[0]);
      if (!amount || amount < 1) return;

      let remaining = amount;

      while (remaining > 0) {
        const fetchSize = remaining > 100 ? 100 : remaining;
        const messages = await message.channel.messages.fetch({ limit: fetchSize }).catch(() => null);
        if (!messages || messages.size === 0) break;

        const deletable = messages.filter(m => Date.now() - m.createdTimestamp < 1209600000);
        const bulk = deletable.filter(m => m.bulkDeletable);

        if (bulk.size > 0) {
          await message.channel.bulkDelete(bulk, true).catch(() => {});
        }

        const single = deletable.filter(m => !m.bulkDeletable);
        for (const m of single.values()) {
          await m.delete().catch(() => {});
        }

        remaining -= messages.size;
        if (messages.size < fetchSize) break;
      }

      return;
    }
  });
};