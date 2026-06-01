require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config');
const db = require('quick.db');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

client.config = config;
client.db = db;
const fs = require('fs');
const { Collection } = require('discord.js');

// Load commands
client.commands = new Collection();
if (fs.existsSync('./commands')) {
  const commandFiles = fs.readdirSync('./commands').filter(f => f.endsWith('.js'));
  for (const file of commandFiles) {
    const cmd = require(`./commands/${file}`);
    if (cmd.data && cmd.execute) client.commands.set(cmd.data.name, cmd);
  }
}

// Interaction handling for slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(client, interaction);
  } catch (err) {
    console.error(err);
    if (interaction.replied || interaction.deferred) {
      interaction.followUp({ content: 'There was an error executing this command.', ephemeral: true }).catch(() => {});
    } else {
      interaction.reply({ content: 'There was an error executing this command.', ephemeral: true }).catch(() => {});
    }
  }
});

// Load events
const events = [
  "ready", "guildBanAdd", "guildMemberRemove", 
  "channelDelete", "channelCreate", "roleDelete", 
  "roleCreate", "webhookCreate"
];

events.forEach(event => {
  const handler = require(`./events/${event}`);
  client.on(event, (...args) => handler(client, ...args));
});

client.login(process.env.TOKEN).catch(console.error);