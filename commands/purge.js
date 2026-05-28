import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("purge")
    .setDescription("Delete messages")
    .addIntegerOption(o =>
      o.setName("amount").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");

    if (amount > 100) {
      return interaction.reply({ content: "Max 100 messages", ephemeral: true });
    }

    await interaction.channel.bulkDelete(amount, true);

    return interaction.reply(`🧹 Deleted ${amount} messages`);
  }
};
