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

// ================= HELPERS =================
function parseDuration(input) {
  const match = input.match(/^(\d+)(s|m|h|d|w|mo)$/);
  if (!match) return null;

  const value = parseInt(match[1]);
  const unit = match[2];

  const map = {
    s: 1000,
    m: 1000 * 60,
    h: 1000 * 60 * 60,
    d: 1000 * 60 * 60 * 24,
    w: 1000 * 60 * 60 * 24 * 7,
    mo: 1000 * 60 * 60 * 24 * 30
  };

  return value * map[unit];
}

// ================= COMMANDS =================
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot latency"),

  new SlashCommandBuilder()
    .setName("say")
    .setDescription("Make the bot say something")
    .addStringOption(o =>
      o.setName("message").setDescription("Message").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Get user info")
    .addUserOption(o =>
      o.setName("user").setDescription("User").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user")
    .addUserOption(o =>
      o.setName("user").setDescription("User").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("reason").setDescription("Reason")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user")
    .addUserOption(o =>
      o.setName("user").setDescription("User").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("reason").setDescription("Reason")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Timeout a user (s m h d w mo)")
    .addUserOption(o =>
      o.setName("user").setDescription("User").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("duration").setDescription("10s 5m 2h 1d 1w 1mo").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("reason").setDescription("Reason")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
].map(c => c.toJSON());

// ================= REGISTER =================
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

async function registerCommands() {
  try {
    console.log("🔄 Registering commands...");

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("✅ Commands registered!");
  } catch (err) {
    console.error("❌ Command error:", err);
  }
}

// ================= READY =================
client.once("ready", async () => {
  console.log(`✅ Bot online as ${client.user.tag}`);
  await registerCommands();
});

// ================= INTERACTIONS =================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
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

    // USER INFO
    if (commandName === "userinfo") {
      const user = interaction.options.getUser("user") || interaction.user;

      return interaction.reply({
        content: `👤 User: ${user.tag}\n🆔 ID: ${user.id}`
      });
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

    // TIMEOUT (FIXED FLEXIBLE)
    if (commandName === "timeout") {
      const user = interaction.options.getUser("user");
      const duration = interaction.options.getString("duration");
      const reason = interaction.options.getString("reason") || "No reason";

      const member = await interaction.guild.members.fetch(user.id);

      const ms = parseDuration(duration);

      if (!ms) {
        return interaction.reply("❌ Invalid format. Use 10s, 5m, 2h, 1d, 1w, 1mo");
      }

      await member.timeout(ms, reason);

      return interaction.reply(
        `⏳ Timed out ${user.tag} for ${duration} | ${reason}`
      );
    }

  } catch (err) {
    console.error(err);
    return interaction.reply("❌ Error executing command (check permissions / role hierarchy)");
  }
});

client.login(process.env.TOKEN);
