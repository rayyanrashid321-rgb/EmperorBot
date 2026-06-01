const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('Assign or remove a role from a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((sub) =>
      sub
        .setName('assign')
        .setDescription('Give a role to a user')
        .addUserOption((opt) => opt.setName('user').setDescription('User to assign a role').setRequired(true))
        .addRoleOption((opt) => opt.setName('role').setDescription('Role to assign').setRequired(true))
    )
    .addSubcommand((sub) =>
      sub
        .setName('remove')
        .setDescription('Remove a role from a user')
        .addUserOption((opt) => opt.setName('user').setDescription('User to remove a role from').setRequired(true))
        .addRoleOption((opt) => opt.setName('role').setDescription('Role to remove').setRequired(true))
    ),

  async execute(client, interaction) {
    const sub = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser('user');
    const role = interaction.options.getRole('role');
    const guild = interaction.guild;

    if (!guild) {
      return interaction.reply({ content: 'This command can only be used inside a server.', ephemeral: true });
    }

    const member = await guild.members.fetch(targetUser.id).catch(() => null);
    if (!member) {
      return interaction.reply({ content: 'That user is not in this server.', ephemeral: true });
    }

    if (!role) {
      return interaction.reply({ content: 'Role not found.', ephemeral: true });
    }

    if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
      return interaction.reply({ content: 'I need the Manage Roles permission to do that.', ephemeral: true });
    }

    if (role.position >= guild.members.me.roles.highest.position) {
      return interaction.reply({ content: 'I cannot manage that role because it is higher than or equal to my highest role.', ephemeral: true });
    }

    try {
      if (sub === 'assign') {
        await member.roles.add(role);
        return interaction.reply({ content: `✅ Added ${role} to ${targetUser.tag}.`, ephemeral: false });
      }

      if (sub === 'remove') {
        await member.roles.remove(role);
        return interaction.reply({ content: `✅ Removed ${role} from ${targetUser.tag}.`, ephemeral: false });
      }
    } catch (err) {
      console.error(err);
      return interaction.reply({ content: 'I could not update that role. Check my permissions and role position.', ephemeral: true });
    }
  },
};
