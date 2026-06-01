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
    )
    .addUserOption((option) =>
      option.setName('member').setDescription('Member to mention in the preview')
    ),
  async execute(client, interaction) {
    const type = interaction.options.getString('type');
    const user = interaction.options.getUser('member') || interaction.user;

    const embed = new EmbedBuilder()
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .setTimestamp();

    if (type === 'welcome') {
      embed
        .setTitle('👋 Welcome!')
        .setDescription(`Say hello to <@${user.id}> and welcome them to **${interaction.guild.name}**!`)
        .addFields(
          { name: 'Member Count', value: `${interaction.guild.memberCount}`, inline: true },
          { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
        )
        .setColor('Green');
    } else {
      embed
        .setTitle('👋 Farewell!')
        .setDescription(`${user.tag} has left **${interaction.guild.name}**.`)
        .addFields({ name: 'Member Count', value: `${interaction.guild.memberCount}`, inline: true })
        .setColor('Red');
    }

    return interaction.reply({ embeds: [embed] });
  },
};
