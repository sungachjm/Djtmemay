const afkList = new Map();

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;

    const userId = message.author.id;
    const nickname = message.member.nickname;

    if (afkList.has(userId)) {
      const data = afkList.get(userId);
      afkList.delete(userId);

      if (nickname && nickname.startsWith("[AFK] ")) {
        await message.member.setNickname(nickname.replace("[AFK] ", "")).catch(() => {});
      } else if (!nickname) {
        const base = message.author.username;
        if (base.startsWith("[AFK] ")) {
          await message.member.setNickname(base.replace("[AFK] ", "")).catch(() => {});
        }
      }

      await message.reply(`Chào mừng trở lại, đã gỡ trạng thái AFK.`).catch(() => {});
      return;
    }

    if (message.mentions.users.size > 0) {
      for (const mentioned of message.mentions.users.values()) {
        if (afkList.has(mentioned.id)) {
          const data = afkList.get(mentioned.id);
          await message.reply(`<@${mentioned.id}> đang AFK: ${data.reason}`).catch(() => {});
        }
      }
    }

    if (!message.content.startsWith(client.prefix)) return;

    const args = message.content.slice(client.prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "afk") {
      const reason = args.join(" ") || "Không có lý do";
      afkList.set(userId, { reason });

      const base = nickname || message.author.username;
      const clean = base.startsWith("[AFK] ") ? base.replace("[AFK] ", "") : base;
      await message.member.setNickname(`[AFK] ${clean}`).catch(() => {});

      await message.reply(`Đã đặt trạng thái AFK: ${reason}`).catch(() => {});
      return;
    }
  });
};