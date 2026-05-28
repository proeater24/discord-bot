import "dotenv/config";
import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from "discord.js";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// ===== SLASH COMMANDS =====
const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot latency")
    .toJSON()
];

// REGISTER COMMANDS
const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

async function registerCommands() {
  try {
    console.log("Registering slash commands...");

    await rest.put(
      Routes.applicationCommands("YOUR_BOT_CLIENT_ID"),
      { body: commands }
    );

    console.log("Slash commands registered!");
  } catch (err) {
    console.error(err);
  }
}

// BOT READY
client.once("ready", () => {
  console.log(`Bot online as ${client.user.tag}`);
  registerCommands();
});

// HANDLE SLASH COMMANDS
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("🏓 Pong!");
  }
});

client.login(process.env.TOKEN);
