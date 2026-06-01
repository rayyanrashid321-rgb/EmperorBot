module.exports = (client) => {
  console.log(`✅ ${client.user.tag} is now protecting the server!`);
  client.user.setActivity('🛡️ Anti-Nuke Active', { type: 'WATCHING' });
};