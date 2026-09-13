const rapidMap = new Map();

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.author.id === process.env.ID_OWNER) return;

    const key = `${message.guild.id}-${message.author.id}`;
    const now = Date.now();

    if (!rapidMap.has(key)) {
      rapidMap.set(key, { times: [], muted: false });
    }

    const data = rapidMap.get(key);

    if (data.muted) return;

    data.times.push(now);
    data.times = data.times.filter(t => now - t <= 5000);

    if (data.times.length >= 4) {
      const intervals = [];
      for (let i = 1; i < data.times.length; i++) {
        intervals.push(data.times[i] - data.times[i - 1]);
      }

      const rapid = intervals.filter(i => i >= 1000 && i <= 2000);
      if (rapid.length >= 3) {
        const member = await message.guild.members.fetch(message.author.id).catch(() => null);
        if (member) {
          const botMember = message.guild.members.me;
          if (
            botMember.permissions.has("ModerateMembers") &&
            botMember.roles.highest.position > member.roles.highest.position
          ) {
            await member.timeout(900000).catch(() => {});
            data.muted = true;
          }
        }
      }
    }
  });
};