const { AuditLogEvent } = require('discord.js');
const { handleEvent } = require('../utils/antiNuke');

module.exports = async (client, member) => {
  const guild = member.guild;
  if (!guild) return;

  await handleEvent(client, guild, {
    type: AuditLogEvent.MemberKick,
    targetId: member.id,
    keyPrefix: 'kick',
    threshold: client.config.thresholds.kick,
    reason: 'Mass Kick',
    eventName: 'a mass kick'
  });
};