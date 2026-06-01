const { AuditLogEvent } = require('discord.js');
const { handleEvent } = require('../utils/antiNuke');

module.exports = async (client, webhook) => {
  const guild = webhook.guild;
  if (!guild) return;

  await handleEvent(client, guild, {
    type: AuditLogEvent.WebhookCreate,
    targetId: webhook.id,
    keyPrefix: 'webhook',
    threshold: client.config.thresholds.webhook,
    reason: 'Webhook Spam',
    eventName: 'webhook creation spam'
  });
};