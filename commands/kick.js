import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user")
    .addUserOption(o =>
      o.setName("user").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("reason")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason";

    const member = await interaction.guild.members.fetch(user.id);

    await member.kick(reason);

    return interaction.reply(`👢 Kicked ${user.tag}`);
  }
};
