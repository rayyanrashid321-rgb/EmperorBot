const { EmbedBuilder } = require('discord.js');

module.exports = async (client, member) => {
  const guild = member.guild;
  if (!guild) return;

  const welcomeChannel = guild.channels.cache.find(
    (channel) => channel.name === client.config.welcomeChannel && channel.isTextBased()
  );
  if (!welcomeChannel) return;

  const embed = new EmbedBuilder()
    .setTitle('👋 Welcome!')
    .setDescription(`Say hello to <@${member.id}> and welcome them to **${guild.name}**!`)
    .addFields(
      { name: 'Member Count', value: `${guild.memberCount}`, inline: true },
      { name: 'Account Created', value: `<t:${Math.floor(member.user.createdTimestamp / 1000)}:R>`, inline: true }
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 }))
    .setColor('Green')
    .setTimestamp();

  welcomeChannel.send({ embeds: [embed] }).catch(() => {});
};
