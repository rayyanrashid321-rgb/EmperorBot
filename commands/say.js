const { SlashCommandBuilder } = require('discord.js');
const config = require('../config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Send a message through the bot')
    .addStringOption((opt) => opt.setName('message').setDescription('Message to send').setRequired(true))
    .addChannelOption((opt) => opt.setName('channel').setDescription('Channel to send the message in').setRequired(false)),

  async execute(client, interaction) {
    const authorId = interaction.user.id;
    if (String(config.owner) !== String(authorId)) {
      return interaction.reply({ content: 'Only the bot owner can use this command.', ephemeral: true });
    }

    const message = interaction.options.getString('message', true);
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    if (!channel || !channel.isTextBased()) {
      return interaction.reply({ content: 'Please provide a valid text channel.', ephemeral: true });
    }

    await channel.send({ content: message }).catch((err) => {
      console.error(err);
      return interaction.reply({ content: 'I could not send the message there.', ephemeral: true });
    });

    return interaction.reply({ content: '✅ Message sent.', ephemeral: true });
  },
};
