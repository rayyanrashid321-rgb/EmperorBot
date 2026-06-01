const { SlashCommandBuilder, PermissionFlagsBits, PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('antinuke')
    .setDescription('Anti-nuke configuration and controls')
    .addSubcommand((s) => s.setName('enable').setDescription('Enable anti-nuke protections'))
    .addSubcommand((s) => s.setName('disable').setDescription('Disable anti-nuke protections'))
    .addSubcommand((s) =>
      s
        .setName('set-log')
        .setDescription('Set the anti-nuke log channel')
        .addChannelOption((o) => o.setName('channel').setDescription('Text channel').addChannelTypes(ChannelType.GuildText).setRequired(true))
    )
    .addSubcommand((s) => s.setName('status').setDescription('Show anti-nuke status'))
    .addSubcommandGroup((g) =>
      g
        .setName('whitelist')
        .setDescription('Manage whitelist')
        .addSubcommand((sc) => sc.setName('add').setDescription('Add user to whitelist').addUserOption((o) => o.setName('user').setDescription('User to whitelist').setRequired(true)))
        .addSubcommand((sc) => sc.setName('remove').setDescription('Remove user from whitelist').addUserOption((o) => o.setName('user').setDescription('User to remove').setRequired(true)))
    ),

  async execute(client, interaction) {
    const member = interaction.member;
    const userId = interaction.user.id;
    const isOwner = String(client.config.owner) === String(userId) || (client.config.whitelist || []).includes(String(userId));

    const hasAdminPermission = member?.permissions?.has
      ? member.permissions.has(PermissionFlagsBits.Administrator)
      : new PermissionsBitField(member?.permissions || 0).has(PermissionFlagsBits.Administrator);

    if (!hasAdminPermission && !isOwner) {
      return interaction.reply({ content: 'You need Administrator to use this.', flags: 64 });
    }

    const sub = interaction.options.getSubcommand(false);
    const group = interaction.options.getSubcommandGroup(false);
    const guildId = interaction.guild.id;

    if (group === 'whitelist') {
      const user = interaction.options.getUser('user');
      const key = `antinuke_${guildId}_whitelist`;
      let list = (await client.db.get(key)) || [];
      if (sub === 'add') {
        if (list.includes(user.id)) return interaction.reply({ content: 'User already whitelisted.', flags: 64 });
        list.push(user.id);
        await client.db.set(key, list);
        return interaction.reply({ content: `Added ${user.tag} to whitelist.`, flags: 64 });
      }
      if (sub === 'remove') {
        list = list.filter((id) => id !== user.id);
        await client.db.set(key, list);
        return interaction.reply({ content: `Removed ${user.tag} from whitelist.`, flags: 64 });
      }
    }

    if (sub === 'enable') {
      await client.db.set(`antinuke_${guildId}_enabled`, true);
      return interaction.reply({ content: 'Anti-nuke enabled for this server.', flags: 64 });
    }
    if (sub === 'disable') {
      await client.db.set(`antinuke_${guildId}_enabled`, false);
      return interaction.reply({ content: 'Anti-nuke disabled for this server.', flags: 64 });
    }
    if (sub === 'set-log') {
      const channel = interaction.options.getChannel('channel');
      if (!channel || channel.type !== ChannelType.GuildText) return interaction.reply({ content: 'Please provide a text channel.', flags: 64 });
      await client.db.set(`antinuke_${guildId}_logChannel`, channel.id);
      return interaction.reply({ content: `Log channel set to ${channel}.`, flags: 64 });
    }
    if (sub === 'status') {
      const enabled = await client.db.get(`antinuke_${guildId}_enabled`);
      const logChannelId = await client.db.get(`antinuke_${guildId}_logChannel`);
      const whitelist = (await client.db.get(`antinuke_${guildId}_whitelist`)) || [];
      const parts = [];
      parts.push(`Enabled: ${enabled ? 'Yes' : 'No'}`);
      parts.push(`Log Channel: ${logChannelId ? `<#${logChannelId}>` : client.config.logChannel || 'Not set'}`);
      parts.push(`Whitelist: ${whitelist.length ? whitelist.map((id) => `<@${id}>`).join(', ') : 'None'}`);
      return interaction.reply({ content: parts.join('\n'), flags: 64 });
    }

    return interaction.reply({ content: 'Unknown subcommand.', flags: 64 });
  },
};
