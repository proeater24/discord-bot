import fs from "fs";

const folders = [
  "commands",
  "commands/moderation",
  "commands/roblox",
  "commands/tickets",
  "commands/automod",
  "commands/fun",
  "utils",
  "events",
  "logs"
];

for (const folder of folders) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
    console.log("📁 Created:", folder);
  } else {
    console.log("✔ Exists:", folder);
  }
}

console.log("✅ Folder setup complete!");
