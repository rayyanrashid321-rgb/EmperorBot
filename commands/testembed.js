const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('testembed')
    .setDescription('Send a test welcome or farewell embed in this channel')
    .addStringOption((option) =>
      option
        .setName('type')
        .setDescription('Choose which embed to preview')
        .setRequired(true)
        .addChoices(
          { name: 'Welcome', value: 'welcome' },
          { name: 'Farewell', value: 'farewell' }
        )
    ),
  async execute(client, interaction) {
    try {
      const type = interaction.options.getString('type');
      let embed;

      if (type === 'welcome') {
        embed = new EmbedBuilder()
          .setTitle('👋 Welcome!')
          .setDescription(`Say hello to ${interaction.user.username} and welcome them to **${interaction.guild.name}**!`)
          .addFields(
            { name: 'Member Count', value: `${interaction.guild.memberCount}`, inline: true }
          )
          .setColor(0x00FF00)
          .setTimestamp();
      } else {
        embed = new EmbedBuilder()
          .setTitle('👋 Farewell!')
          .setDescription(`${interaction.user.username} has left **${interaction.guild.name}**.`)
          .addFields({ name: 'Member Count', value: `${interaction.guild.memberCount}`, inline: true })
          .setColor(0xFF0000)
          .setTimestamp();
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('testembed command error:', error);
      await interaction.reply({ content: 'Error sending embed.', flags: 64 }).catch(() => {});
    }
  },
};
