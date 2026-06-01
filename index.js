require('dotenv').config();
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
      return interaction.reply({ content: 'This poll has expired or is unavailable.', ephemeral: true });
    }

    const index = Number(optionIndex);
    if (Number.isNaN(index) || index < 0 || index >= poll.options.length) {
      return interaction.reply({ content: 'Invalid poll option.', ephemeral: true });
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