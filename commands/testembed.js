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
      console.log(`Executing /testembed for ${interaction.user.tag} (type=${type})`);
      const guildName = interaction.guild?.name || 'this server';
      const memberCount = interaction.guild?.memberCount ? `${interaction.guild.memberCount}` : 'unknown';
      let embed;

      if (type === 'welcome') {
        embed = new EmbedBuilder()
          .setTitle('👋 Welcome!')
          .setDescription(`Say hello to ${interaction.user.username} and welcome them to **${guildName}**!`)
          .addFields({ name: 'Member Count', value: memberCount, inline: true })
          .setColor(0x00FF00)
          .setTimestamp();
      } else if (type === 'farewell') {
        embed = new EmbedBuilder()
          .setTitle('👋 Farewell!')
          .setDescription(`${interaction.user.username} has left **${guildName}**.`)
          .addFields({ name: 'Member Count', value: memberCount, inline: true })
          .setColor(0xFF0000)
          .setTimestamp();
      } else {
        throw new Error(`Unknown embed type: ${type}`);
      }

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('testembed command error:', error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({ content: 'Error sending embed.', flags: 64 }).catch(() => {});
      } else {
        await interaction.reply({ content: 'Error sending embed.', flags: 64 }).catch(() => {});
      }
    }
  },
};
