import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("untimeout")
    .setDescription("Remove timeout from user")
    .addUserOption(o =>
      o.setName("user").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(user.id);

    await member.timeout(null);

    return interaction.reply(`✅ Timeout removed`);
  }
};
