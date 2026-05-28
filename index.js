import "dotenv/config";
import {
  Client,
  GatewayIntentBits,
  Collection
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

loadCommands(path.join(__dirname, "commands"));

client.once("ready", () => {
  console.log(`✅ Bot online as ${client.user.tag}`);
});

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
