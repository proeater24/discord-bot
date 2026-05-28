import fs from "fs";

// helper
function createFile(path, content) {
  if (!fs.existsSync(path)) {
    fs.writeFileSync(path, content);
    console.log("📄 Created:", path);
  } else {
    console.log("✔ Exists:", path);
  }
}

/* ================= ROOT FILES ================= */

createFile("index.js", `
import "dotenv/config";
import { Client, GatewayIntentBits, Collection } from "discord.js";
import fs from "fs";
import path from "path";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.commands = new Collection();

function load(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const full = path.join(dir, file.name);

    if (file.isDirectory()) {
      load(full);
    } else if (file.name.endsWith(".js")) {
      import(full).then(cmd => {
        if (cmd.default?.data?.name) {
          client.commands.set(cmd.default.data.name, cmd.default);
        }
      });
    }
  }
}

load("./commands");

client.once("ready", () => {
  console.log(\`✅ Logged in as \${client.user.tag}\`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const cmd = client.commands.get(interaction.commandName);
  if (!cmd) return;

  try {
    await cmd.execute(interaction);
  } catch (e) {
    console.error(e);
    await interaction.reply({ content: "❌ Error", ephemeral: true });
  }
});

client.login(process.env.TOKEN);
`);

/* ================= UTILS ================= */

createFile("utils/duration.js", `
export function parseDuration(input) {
  const match = input.match(/^(\\d+)(s|m|h|d|w|mo)$/);
  if (!match) return null;

  const value = Number(match[1]);
  const unit = match[2];

  const map = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000,
    w: 604800000,
    mo: 2592000000
  };

  return value * map[unit];
}
`);

/* ================= BASIC COMMANDS ================= */

createFile("commands/ping.js", `
import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check bot latency"),

  async execute(interaction) {
    return interaction.reply("🏓 Pong!");
  }
};
`);

createFile("commands/say.js", `
import { SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("say")
    .setDescription("Make bot say something")
    .addStringOption(o =>
      o.setName("message").setRequired(true)
    ),

  async execute(interaction) {
    const msg = interaction.options.getString("message");
    return interaction.reply(msg);
  }
};
`);

createFile("commands/moderation/kick.js", `
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kick a user")
    .addUserOption(o => o.setName("user").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const member = await interaction.guild.members.fetch(user.id);

    await member.kick();

    return interaction.reply(\`👢 Kicked \${user.tag}\`);
  }
};
`);

createFile("commands/moderation/ban.js", `
import { SlashCommandBuilder, PermissionFlagsBits } from "discord.js";

export default {
  data: new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Ban a user")
    .addUserOption(o => o.setName("user").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const user = interaction.options.getUser("user");

    await interaction.guild.members.ban(user.id);

    return interaction.reply(\`🔨 Banned \${user.tag}\`);
  }
};
`);

console.log("🚀 All files created!");
