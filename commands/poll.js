const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a simple poll with buttons')
    .addStringOption((opt) => opt.setName('question').setDescription('The poll question').setRequired(true))
    .addStringOption((opt) => opt.setName('option1').setDescription('Option 1').setRequired(true))
    .addStringOption((opt) => opt.setName('option2').setDescription('Option 2').setRequired(true))
    .addStringOption((opt) => opt.setName('option3').setDescription('Option 3').setRequired(false))
    .addStringOption((opt) => opt.setName('option4').setDescription('Option 4').setRequired(false))
    .addStringOption((opt) => opt.setName('option5').setDescription('Option 5').setRequired(false)),

  async execute(client, interaction) {
    const question = interaction.options.getString('question', true);
    const options = [
      interaction.options.getString('option1', true),
      interaction.options.getString('option2', true),
    ];

    for (let i = 3; i <= 5; i += 1) {
      const option = interaction.options.getString(`option${i}`);
      if (option) options.push(option);
    }

    const pollId = `poll_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const buttons = options.map((option, index) =>
      new ButtonBuilder()
        .setCustomId(`poll_vote|${pollId}|${index}`)
        .setLabel(option.length > 80 ? `${option.slice(0, 77)}...` : option)
        .setStyle(ButtonStyle.Primary)
    );

    const rows = [];
    for (let i = 0; i < buttons.length; i += 5) {
      rows.push(new ActionRowBuilder().addComponents(buttons.slice(i, i + 5)));
    }

    const embed = new EmbedBuilder()
      .setTitle('📊 Poll')
      .setDescription(`**${question}**`)
      .addFields(options.map((option, index) => ({ name: `Option ${index + 1}`, value: option, inline: false })))
      .setFooter({ text: 'Vote by clicking a button!' })
      .setColor('Purple')
      .setTimestamp();

    await client.db.set(pollId, { question, options, counts: options.map(() => 0) });
    return interaction.reply({ embeds: [embed], components: rows });
  },
};
