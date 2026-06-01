const { AuditLogEvent } = require('discord.js');
const { handleEvent } = require('../utils/antiNuke');

module.exports = async (client, role) => {
  const guild = role.guild;
  if (!guild) return;

  await handleEvent(client, guild, {
    type: AuditLogEvent.RoleCreate,
    targetId: role.id,
    keyPrefix: 'role',
    threshold: client.config.thresholds.role,
    reason: 'Mass Role Create',
    eventName: 'mass role creation'
  });
};