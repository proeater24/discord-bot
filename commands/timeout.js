import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

function parseTime(input) {
  const match = input.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;

  const value = Number(match[1]);
  const unit = match[2];

  const map = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000
  };

  return value * map[unit];
}

export default {
  data: new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a user")
    .addUserOption(o =>
      o.setName("user").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("time").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("reason")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const time = interaction.options.getString("time");
    const reason = interaction.options.getString("reason") || "No reason";

    const ms = parseTime(time);
    if (!ms) {
      return interaction.reply({
        content: "❌ Use format: 10s, 5m, 2h, 1d",
        ephemeral: true
      });
    }

    const member = await interaction.guild.members.fetch(user.id);

    await member.timeout(ms, reason);

    return interaction.reply(`⏳ Timed out ${user.tag}`);
  }
};
