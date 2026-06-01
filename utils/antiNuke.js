const { AuditLogEvent } = require('discord.js');
const config = require('../config');

function isWhitelisted(id) {
  return Boolean(id) && (id === config.owner || config.whitelist.includes(id));
}

async function punish(guild, executorId, reason) {
  if (config.punishment === 'kick') {
    return guild.members.kick(executorId, { reason }).catch(() => {});
  }
  return guild.members.ban(executorId, { reason }).catch(() => {});
}

async function getAuditEntry(guild, type, targetId) {
  try {
    const logs = await guild.fetchAuditLogs({ type, limit: 1 });
    const entry = logs.entries.first();
    if (!entry) return null;
    if (targetId && entry.target?.id !== targetId) return null;
    return entry;
  } catch (error) {
    return null;
  }
}

async function logAction(client, guild, message) {
  try {
    // Check per-guild log channel in DB first
    const guildLogId = await client.db.get(`antinuke_${guild.id}_logChannel`);
    let channel = null;
    if (guildLogId) {
      channel = guild.channels.cache.get(guildLogId);
    }
    // Fallback to config log channel name
    if (!channel && config.logChannel) {
      channel = guild.channels.cache.find((ch) => ch.name === config.logChannel && ch.isTextBased());
    }
    if (!channel) return;
    return channel.send({ content: message }).catch(() => {});
  } catch (err) {
    return null;
  }
}

async function handleEvent(client, guild, options) {
  const { type, targetId, keyPrefix, threshold, reason, eventName } = options;
  // Check if anti-nuke is disabled for this guild
  const enabled = await client.db.get(`antinuke_${guild.id}_enabled`);
  if (enabled === false) return;
  const entry = await getAuditEntry(guild, type, targetId);
  if (!entry) return;

  const executor = entry.executor;
  if (!executor || executor.id === client.user.id) return;

  // Respect global and per-guild whitelists
  const guildWL = (await client.db.get(`antinuke_${guild.id}_whitelist`)) || [];
  if (isWhitelisted(executor.id) || guildWL.includes(executor.id)) return;

  const key = `${keyPrefix}_${executor.id}`;
  let count = (await client.db.get(key)) || 0;
  count += 1;
  if (count >= threshold) {
    await punish(guild, executor.id, `Anti-Nuke: ${reason}`);
    await client.db.delete(key);
    await logAction(
      client,
      guild,
      `⚠️ ${executor.tag} (${executor.id}) was punished for ${eventName} in ${guild.name}.`
    );
  } else {
    await client.db.set(key, count);
    setTimeout(() => client.db.delete(key), 15000);
  }
}

module.exports = { AuditLogEvent, isWhitelisted, punish, handleEvent };
