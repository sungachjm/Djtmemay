const spamMap = new Map();

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.author.id === process.env.ID_OWNER) return;

    const key = `${message.guild.id}-${message.author.id}`;

    if (!spamMap.has(key)) {
      spamMap.set(key, { count: 0, warns: 0, timer: null });
    }

    const data = spamMap.get(key);
    data.count += 1;

    if (data.timer) clearTimeout(data.timer);
    data.timer = setTimeout(() => {
      spamMap.delete(key);
    }, 10000);

    if (data.count > 10) {
      const fetched = await message.channel.messages.fetch({ limit: 100 }).catch(() => null);
      if (fetched) {
        const userMsgs = fetched.filter(m => m.author.id === message.author.id);
        for (const m of userMsgs.values()) {
          await m.delete().catch(() => {});
        }
      }

      data.warns += 1;

      if (data.warns > 3) {
        const member = await message.guild.members.fetch(message.author.id).catch(() => null);
        if (member) {
          await member.timeout(300000).catch(() => {});
        }
        spamMap.delete(key);
        return;
      }

      await message.channel.send(`<@${message.author.id}> cảnh báo spam (${data.warns}/3)`).catch(() => {});
      data.count = 0;
      return;
    }
  });
};