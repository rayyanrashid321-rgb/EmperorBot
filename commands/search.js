const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Create a quick search link')
    .addStringOption((opt) => opt.setName('query').setDescription('What do you want to search for?').setRequired(true)),

  async execute(client, interaction) {
    const query = interaction.options.getString('query', true);
    const encoded = encodeURIComponent(query);
    const url = `https://www.google.com/search?q=${encoded}`;
    return interaction.reply({ content: `🔎 Here is your search link:
${url}`, ephemeral: false });
  },
};
