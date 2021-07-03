const { getRoleFromCategory } = require("../../service");
const { sendEphemeral } = require("../utils");
const { client } = require("../../index");

const execute = async (interaction) => {
  const guild = await client.guilds.fetch(process.env.GUILD_ID);

  const data = guild.channels.cache
    .filter((ch) => ch.type === "category" && ch.name.startsWith("📚"))
    .map((ch) => {
      const courseFullName = ch.name.replace("📚", "").trim();
      const courseRole = getRoleFromCategory(ch.name);
      return `${courseFullName} - \`/join ${courseRole}\``;
    })
    .sort((a, b) => a.localeCompare(b));

  if (data.length === 0) sendEphemeral(client, interaction, "No courses available");
  else sendEphemeral(client, interaction, data.join(" \n"));
};

module.exports = {
  name: "courses",
  description: "Prints out the courses to use with `/join` and `/leave`.",
  usage: "[no arg]",
  args: false,
  joinArgs: false,
  guide: false,
  options: [
    {
      required: false,
    },
  ],
  execute,
};
