module.exports = {
  prefix: "!",
  owner: process.env.OWNER_ID,
  whitelist: [process.env.OWNER_ID].filter(Boolean), // Add your trusted IDs later
  welcomeChannel: "welcome",
  farewellChannel: "goodbye",
  logChannel: "antinuke-logs",
  punishment: "ban", // "ban" or "kick"
  thresholds: {
    ban: 3,
    kick: 4,
    channel: 5,
    role: 5,
    webhook: 2
  }
};