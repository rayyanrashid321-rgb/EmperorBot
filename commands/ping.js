const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder().setName('ping').setDescription('Bot latency'),
  async execute(client, interaction) {
    const sent = await interaction.reply({ content: 'Pinging...', fetchReply: true });
    const diff = sent.createdTimestamp - interaction.createdTimestamp;
    return interaction.editReply(`Pong! API: ${Math.round(client.ws.ping)}ms | Roundtrip: ${diff}ms`);
  },
};
