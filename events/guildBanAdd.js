const { AuditLogEvent } = require('discord.js');
const { handleEvent } = require('../utils/antiNuke');

module.exports = async (client, ban) => {
  const guild = ban.guild;
  if (!guild) return;

  await handleEvent(client, guild, {
    type: AuditLogEvent.MemberBanAdd,
    targetId: ban.user?.id,
    keyPrefix: 'ban',
    threshold: client.config.thresholds.ban,
    reason: 'Mass Ban',
    eventName: 'a mass ban'
  });
};