import "dotenv/config";
import fs from "fs";
import { REST, Routes } from "discord.js";

const CLIENT_ID = "1509525176851890247";
const GUILD_ID = "1505645963870736384";

const commands = [];
const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  commands.push(command.default.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("🔄 Clearing old commands...");

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: [] }
    );

    console.log("🔄 Registering new commands...");

    await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands }
    );

    console.log("✅ Slash commands updated!");
  } catch (err) {
    console.error(err);
  }
})();
