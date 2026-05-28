import "dotenv/config";
import { Client, GatewayIntentBits } from "discord.js";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.on("ready", () => {
  console.log(`✅ Bot online as ${client.user.tag}`);
});

client.on("messageCreate", (msg) => {
  if (msg.author.bot) return;

  if (msg.content === "!ping") {
    msg.reply("🏓 Pong!");
  }
});

client.login(process.env.TOKEN);
