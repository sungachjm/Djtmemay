const imageMap = new Map();

module.exports = (client) => {
  client.on("messageCreate", async (message) => {
    if (message.author.bot) return;
    if (!message.guild) return;
    if (message.author.id === process.env.ID_OWNER) return;

    const key = `${message.guild.id}-${message.author.id}`;
    const now = Date.now();

    const attachments = message.attachments.filter(a =>
      a.contentType && a.contentType.startsWith("image/")
    );
    const embeds = message.embeds.filter(e => e.image || e.thumbnail);

    const imageCount = attachments.size + embeds.length;
    if (imageCount < 4) return;

    if (!imageMap.has(key)) {
      imageMap.set(key, { muted: false });
    }

    const data = imageMap.get(key);
    if (data.muted) return;

    await message.delete().catch(() => {});

    const member = await message.guild.members.fetch(message.author.id).catch(() => null);
    if (!member) return;

    const botMember = message.guild.members.me;
    if (
      botMember.permissions.has("ModerateMembers") &&
      botMember.roles.highest.position > member.roles.highest.position
    ) {
      await member.timeout(604800000).catch(() => {});
      data.muted = true;
    }
  });
};