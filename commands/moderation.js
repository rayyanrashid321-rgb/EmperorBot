const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('moderation')
    .setDescription('Moderation tools for server staff')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addSubcommand((sub) =>
      sub
        .setName('kick')
        .setDescription('Kick a member from the server')
        .addUserOption((opt) => opt.setName('user').setDescription('Member to kick').setRequired(true))
        .addStringOption((opt) => opt.setName('reason').setDescription('Reason for kick').setRequired(false))
    )
    .addSubcommand((sub) =>
      sub
        .setName('ban')
        .setDescription('Ban a member from the server')
        .addUserOption((opt) => opt.setName('user').setDescription('Member to ban').setRequired(true))
        .addStringOption((opt) => opt.setName('reason').setDescription('Reason for ban').setRequired(false))
        .addIntegerOption((opt) =>
          opt
            .setName('delete_days')
            .setDescription('Delete messages from the past X days (0-7)')
            .setRequired(false)
            .setMinValue(0)
            .setMaxValue(7)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName('timeout')
        .setDescription('Timeout a member for a period of time')
        .addUserOption((opt) => opt.setName('user').setDescription('Member to timeout').setRequired(true))
        .addStringOption((opt) =>
          opt
            .setName('duration')
            .setDescription('Duration like 10m, 1h, 1d')
            .setRequired(true)
        )
        .addStringOption((opt) => opt.setName('reason').setDescription('Reason for timeout').setRequired(false))
    )
    .addSubcommand((sub) =>
      sub
        .setName('unban')
        .setDescription('Unban a user by mention or ID')
        .addUserOption((opt) => opt.setName('user').setDescription('User to unban').setRequired(true))
    ),

  async execute(client, interaction) {
    const sub = interaction.options.getSubcommand();
    const guild = interaction.guild;
    const target = interaction.options.getUser('user', true);
    const reason = interaction.options.getString('reason') || 'No reason provided';

    if (!guild) {
      return interaction.reply({ content: 'This command only works in a server.', flags: 64 });
    }

    if (!guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers) && !guild.members.me.permissions.has(PermissionFlagsBits.KickMembers) && !guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
      return interaction.reply({ content: 'I need moderation permissions to perform this action.', flags: 64 });
    }

    const member = await guild.members.fetch(target.id).catch(() => null);

    if (sub === 'kick') {
      if (!member) return interaction.reply({ content: 'That user is not in the server.', flags: 64 });
      if (!guild.members.me.permissions.has(PermissionFlagsBits.KickMembers)) {
        return interaction.reply({ content: 'I need Kick Members permission to do that.', flags: 64 });
      }
      if (!member.kickable) {
        return interaction.reply({ content: 'I cannot kick that member. Check my role position and permissions.', flags: 64 });
      }
      await member.kick(reason).catch((err) => {
        console.error(err);
      });
      return interaction.reply({ content: `✅ Kicked ${target.tag}. Reason: ${reason}` });
    }

    if (sub === 'ban') {
      if (!guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.reply({ content: 'I need Ban Members permission to do that.', flags: 64 });
      }
      await guild.members.ban(target.id, { days: interaction.options.getInteger('delete_days') ?? 0, reason }).catch((err) => {
        console.error(err);
      });
      return interaction.reply({ content: `✅ Banned ${target.tag}. Reason: ${reason}` });
    }

    if (sub === 'timeout') {
      if (!member) return interaction.reply({ content: 'That user is not in the server.', flags: 64 });
      if (!guild.members.me.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return interaction.reply({ content: 'I need Moderate Members permission to timeout users.', flags: 64 });
      }
      const duration = interaction.options.getString('duration', true).toLowerCase();
      const milliseconds = parseDuration(duration);
      if (!milliseconds || milliseconds < 1000 || milliseconds > 2_419_200_000) {
        return interaction.reply({ content: 'Please provide a valid timeout between 1 second and 28 days, e.g. 10m, 1h.', flags: 64 });
      }
      await member.timeout(milliseconds, reason).catch((err) => {
        console.error(err);
      });
      return interaction.reply({ content: `✅ Timed out ${target.tag} for ${duration}. Reason: ${reason}` });
    }

    if (sub === 'unban') {
      if (!guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.reply({ content: 'I need Ban Members permission to unban users.', flags: 64 });
      }
      await guild.bans.remove(target.id).catch((err) => {
        console.error(err);
      });
      return interaction.reply({ content: `✅ Unbanned ${target.tag}.` });
    }

    return interaction.reply({ content: 'Unknown moderation command.', flags: 64 });
  },
};

function parseDuration(value) {
  const match = /^([0-9]+)(s|m|h|d)$/.exec(value);
  if (!match) return null;
  const amount = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's': return amount * 1000;
    case 'm': return amount * 60 * 1000;
    case 'h': return amount * 60 * 60 * 1000;
    case 'd': return amount * 24 * 60 * 60 * 1000;
    default: return null;
  }
}
