const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('info')
    .setDescription('Get user or server information')
    .addSubcommand((sub) =>
      sub
        .setName('user')
        .setDescription('Get information about a user')
        .addUserOption((opt) => opt.setName('target').setDescription('The user to look up').setRequired(false))
    )
    .addSubcommand((sub) => sub.setName('server').setDescription('Get information about this server')),

  async execute(client, interaction) {
    const sub = interaction.options.getSubcommand();
    const guild = interaction.guild;

    if (sub === 'user') {
      const user = interaction.options.getUser('target') || interaction.user;
      const member = guild ? await guild.members.fetch(user.id).catch(() => null) : null;
      const embed = new EmbedBuilder()
        .setTitle(`${user.tag}`)
        .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: 'ID', value: user.id, inline: true },
          { name: 'Bot', value: user.bot ? 'Yes' : 'No', inline: true }
        )
        .setColor('Blurple')
        .setTimestamp();

      if (member) {
        embed.addFields(
          { name: 'Joined Server', value: `<t:${Math.floor(member.joinedTimestamp / 1000)}:R>`, inline: true },
          { name: 'Roles', value: `${member.roles.cache.size - 1}`, inline: true }
        );
      }

      return interaction.reply({ embeds: [embed], ephemeral: false });
    }

    if (sub === 'server') {
      if (!guild) {
        return interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
      }
      const embed = new EmbedBuilder()
        .setTitle(`${guild.name}`)
        .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
        .addFields(
          { name: 'Server ID', value: guild.id, inline: true },
          { name: 'Owner', value: `<@${guild.ownerId}>`, inline: true },
          { name: 'Members', value: `${guild.memberCount}`, inline: true },
          { name: 'Roles', value: `${guild.roles.cache.size}`, inline: true },
          { name: 'Channels', value: `${guild.channels.cache.size}`, inline: true },
          { name: 'Created', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }
        )
        .setColor('Green')
        .setTimestamp();

      return interaction.reply({ embeds: [embed], ephemeral: false });
    }

    return interaction.reply({ content: 'Unknown subcommand.', ephemeral: true });
  },
};
