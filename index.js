require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config');

const dbFilePath = path.join(__dirname, 'db.json');

function readDb() {
  try {
    if (!fs.existsSync(dbFilePath)) return {};
    const raw = fs.readFileSync(dbFilePath, 'utf8');
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    return {};
  }
}

function writeDb(data) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to write DB:', err);
  }
}

const db = {
  async get(key) {
    const data = readDb();
    return data[key];
  },
  async set(key, value) {
    const data = readDb();
    data[key] = value;
    writeDb(data);
    return value;
  },
  async delete(key) {
    const data = readDb();
    delete data[key];
    writeDb(data);
    return true;
  },
};

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