import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
  PermissionFlagsBits
} from "discord.js";

const CLIENT_ID = "1509525176851890247";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ================= COMMANDS =================
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot latency"),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user")
    .addUserOption(opt =>
      opt.setName("user").setDescription("User to kick").setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("reason").setDescription("Reason").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user")
    .addUserOption(opt =>
      opt.setName("user").setDescription("User to ban").setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("reason").setDescription("Reason").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a user (minutes)")
    .addUserOption(opt =>
      opt.setName("user").setDescription("User").setRequired(true)
    )
    .addIntegerOption(opt =>
      opt.setName("minutes").setDescription("Minutes").setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName("reason").setDescription("Reason").setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers),

  new SlashCommandBuilder()
    .setName("say")
    .setDescription("Make bot say something")
    .addStringOption(opt =>
      opt.setName("message").setDescription("Message").setRequired(true)
    )
].map(c => c.toJSON());

// ================= REST =================
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

async function registerCommands() {
  await rest.put(
    Routes.applicationCommands(CLIENT_ID),
    { body: commands }
  );

  console.log("✅ Slash commands registered");
}

// ================= READY =================
client.once("ready", async () => {
  console.log(`✅ Bot online as ${client.user.tag}`);
  await registerCommands();
});

// ================= COMMAND HANDLER =================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // PING
  if (commandName === "ping") {
    return interaction.reply("🏓 Pong!");
  }

  // SAY
  if (commandName === "say") {
    const msg = interaction.options.getString("message");
    return interaction.reply({ content: msg });
  }

  // KICK
  if (commandName === "kick") {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason";

    const member = await interaction.guild.members.fetch(user.id);
    await member.kick(reason);

    return interaction.reply(`👢 Kicked ${user.tag} | ${reason}`);
  }

  // BAN
  if (commandName === "ban") {
    const user = interaction.options.getUser("user");
    const reason = interaction.options.getString("reason") || "No reason";

    await interaction.guild.members.ban(user.id, { reason });

    return interaction.reply(`🔨 Banned ${user.tag} | ${reason}`);
  }

  // TIMEOUT
  if (commandName === "timeout") {
    const user = interaction.options.getUser("user");
    const minutes = interaction.options.getInteger("minutes");
    const reason = interaction.options.getString("reason") || "No reason";

    const member = await interaction.guild.members.fetch(user.id);

    await member.timeout(minutes * 60 * 1000, reason);

    return interaction.reply(`⏳ Timed out ${user.tag} for ${minutes}m | ${reason}`);
  }
});

client.login(process.env.TOKEN);
