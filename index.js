import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder
} from "discord.js";

// 🔑 YOUR CLIENT ID (you gave this)
const CLIENT_ID = "1509525176851890247";

// ================= CLIENT =================
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ================= COMMANDS =================
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot latency")
    .toJSON()
];

// ================= REGISTER COMMANDS =================
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

async function registerCommands() {
  try {
    console.log("🔄 Registering slash commands...");

    await rest.put(
      Routes.applicationCommands(CLIENT_ID),
      { body: commands }
    );

    console.log("✅ Slash commands registered!");
  } catch (err) {
    console.error("❌ Command register error:", err);
  }
}

// ================= READY =================
client.once("ready", () => {
  console.log(`✅ Bot online as ${client.user.tag}`);
  registerCommands();
});

// ================= INTERACTIONS =================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("🏓 Pong!");
  }
});

// ================= LOGIN =================
client.login(process.env.TOKEN);
