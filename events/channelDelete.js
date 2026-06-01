const { AuditLogEvent } = require('discord.js');
const { handleEvent } = require('../utils/antiNuke');

module.exports = async (client, channel) => {
  const guild = channel.guild;
  if (!guild) return;

  await handleEvent(client, guild, {
    type: AuditLogEvent.ChannelDelete,
    targetId: channel.id,
    keyPrefix: 'channel',
    threshold: client.config.thresholds.channel,
    reason: 'Mass Channel Delete',
    eventName: 'mass channel deletion'
  });
};