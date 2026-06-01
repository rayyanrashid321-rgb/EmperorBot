const { AuditLogEvent, EmbedBuilder } = require('discord.js');
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

  const farewellChannel = guild.channels.cache.find(
    (channel) => channel.name === client.config.farewellChannel && channel.isTextBased()
  );

  if (!farewellChannel) return;

  const embed = new EmbedBuilder()
    .setTitle('👋 Farewell!')
    .setDescription(`${member.user.tag} has left **${guild.name}**.`)
    .addFields(
      { name: 'Member Count', value: `${guild.memberCount}`, inline: true }
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
    .setColor('Red')
    .setTimestamp();

  farewellChannel.send({ embeds: [embed] }).catch(() => {});
};