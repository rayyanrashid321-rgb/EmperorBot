const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const jokes = [
  'Why did the scarecrow win an award? Because he was outstanding in his field!',
  'I only know 25 letters of the alphabet. I don’t know y.',
  'Why don’t skeletons fight each other? They don’t have the guts.',
  'What do you call fake spaghetti? An impasta!',
  'Why did the math book look sad? Because it had too many problems.'
];

const quotes = [
  'Work hard, stay humble.',
  'Dream big and dare to fail.',
  'Your vibe attracts your tribe.',
  'Small steps every day.',
  'Success is a series of small wins.'
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('fun')
    .setDescription('Fun and interactive commands')
    .addSubcommand((sub) => sub.setName('joke').setDescription('Get a random joke'))
    .addSubcommand((sub) => sub.setName('quote').setDescription('Get a motivating quote'))
    .addSubcommand((sub) => sub.setName('coinflip').setDescription('Flip a coin')),

  async execute(client, interaction) {
    const sub = interaction.options.getSubcommand();
    const embed = new EmbedBuilder().setColor('Random').setTimestamp();

    if (sub === 'joke') {
      embed.setTitle('Random Joke').setDescription(jokes[Math.floor(Math.random() * jokes.length)]);
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'quote') {
      embed.setTitle('Motivational Quote').setDescription(quotes[Math.floor(Math.random() * quotes.length)]);
      return interaction.reply({ embeds: [embed] });
    }

    if (sub === 'coinflip') {
      const result = Math.random() > 0.5 ? 'Heads' : 'Tails';
      embed.setTitle('Coin Flip').setDescription(`The coin landed on **${result}**.`);
      return interaction.reply({ embeds: [embed] });
    }

    return interaction.reply({ content: 'Unknown subcommand.', flags: 64 });
  },
};
