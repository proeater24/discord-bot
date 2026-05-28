import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  Collection,
  REST,
  Routes
} from "discord.js";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

/* ================= LOAD COMMANDS ================= */
function loadCommands(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      loadCommands(fullPath);
    } else if (file.name.endsWith(".js")) {
      import(fullPath).then((cmd) => {
        if (cmd.default?.data?.name) {
          client.commands.set(cmd.default.data.name, cmd.default);
        }
      });
    }
  }
}

/* ================= REGISTER SLASH COMMANDS ================= */
async function registerCommands() {
  const CLIENT_ID = "1509525176851890247";
  const GUILD_ID = "1505645963870736384";

  const commands = [];

  console.log("📦 Loading command files...");

  const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

  for (const file of commandFiles) {
    console.log("➡ Loading:", file);

    const command = await import(`./commands/${file}`);
    commands.push(command.default.data.toJSON());
  }

  console.log(`📊 Total commands loaded: ${commands.length}`);

  const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

  try {
    console.log("🧹 Clearing old commands...");

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: [] }
    );

    console.log("📤 Uploading new commands...");

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("✅ Slash commands fully refreshed!");
  } catch (err) {
    console.error("❌ ERROR REGISTERING COMMANDS:", err);
  }
}

/* ================= BOT READY ================= */
client.once("ready", async () => {
  console.log(`✅ Bot online as ${client.user.tag}`);

  await registerCommands(); // 🔥 AUTO DEPLOY HERE
});

/* ================= COMMAND HANDLER ================= */
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(err);
    await interaction.reply({
      content: "❌ Error running command",
      ephemeral: true
    });
  }
});

client.login(process.env.TOKEN);
