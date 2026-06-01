require('dotenv').config();
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('The ready event has been renamed to clientReady')) {
    return;
  }
  console.warn(warning);
});
process.on('warning', (warning) => {
  if (warning.name === 'DeprecationWarning' && warning.message.includes('The ready event has been renamed to clientReady')) {
    return;
  }
  console.warn(warning);
});
const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
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
  if (interaction.isButton()) {
    const customId = interaction.customId;
    if (!customId.startsWith('poll_vote|')) return;

    const [, pollId, optionIndex] = customId.split('|');
    const poll = await client.db.get(pollId);
    if (!poll || !Array.isArray(poll.options)) {
      return interaction.reply({ content: 'This poll has expired or is unavailable.', flags: 64 });
    }

    const index = Number(optionIndex);
    if (Number.isNaN(index) || index < 0 || index >= poll.options.length) {
      return interaction.reply({ content: 'Invalid poll option.', flags: 64 });
    }

    poll.counts[index] = (poll.counts[index] || 0) + 1;
    await client.db.set(pollId, poll);

    const embed = new EmbedBuilder()
      .setTitle('📊 Poll')
      .setDescription(`**${poll.question}**`)
      .addFields(poll.options.map((option, idx) => ({ name: `Option ${idx + 1}`, value: `${option} — ${poll.counts[idx]} votes`, inline: false })))
      .setFooter({ text: 'Vote by clicking a button!' })
      .setColor('Purple')
      .setTimestamp();

    await interaction.update({ embeds: [embed], components: interaction.message.components }).catch(() => {});
    return;
  }

  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(client, interaction);
  } catch (err) {
    console.error(err);
    if (interaction.replied || interaction.deferred) {
      interaction.followUp({ content: 'There was an error executing this command.', flags: 64 }).catch(() => {});
    } else {
      interaction.reply({ content: 'There was an error executing this command.', flags: 64 }).catch(() => {});
    }
  }
});

// Load events
const eventMappings = [
  { name: 'clientReady', file: 'ready' },
  { name: 'guildBanAdd', file: 'guildBanAdd' },
  { name: 'guildMemberRemove', file: 'guildMemberRemove' },
  { name: 'channelDelete', file: 'channelDelete' },
  { name: 'channelCreate', file: 'channelCreate' },
  { name: 'roleDelete', file: 'roleDelete' },
  { name: 'roleCreate', file: 'roleCreate' },
  { name: 'webhookCreate', file: 'webhookCreate' },
];

let readyHandled = false;

eventMappings.forEach(({ name, file }) => {
  const handler = require(`./events/${file}`);
  client.on(name, (...args) => {
    if (file === 'ready') {
      if (readyHandled) return;
      readyHandled = true;
    }
    handler(client, ...args);
  });
});

client.login(process.env.TOKEN).catch(console.error);