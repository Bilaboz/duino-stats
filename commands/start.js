const { MessageEmbed } = require("discord.js");
const color = require("../utils/color.json");
const axios = require("axios");

const { statisticsChannelID } = require("../utils/config.json");
const api = "https://server.duinocoin.com/api.json";

module.exports.run = async (client, message) => {
    try {
        if (message && !message.member.hasPermission("MANAGE_MESSAGES")) {
            return message.channel.send(":no_entry: You don't have the permission to do that !");
        }

        const channel = client.channels.cache.get(statisticsChannelID);
        await channel.bulkDelete(100);

        const tempEmbed = new MessageEmbed().setDescription("Updating...");
        const msg = await channel.send(tempEmbed);

        const updateStatistics = async () => {
            let stats;
            try {
                const response = await axios.get(api);
                stats = response.data;
            } catch (err) {
                console.error(err);
                tempEmbed.setDescription(`\`ERROR\`: Error while fetching the API`);
                return msg.edit(tempEmbed);
            }

            const embed = new MessageEmbed()
                .setColor(color.yellow)
                .setTitle("Duino-Coin Statistics")
                .setURL("https://revoxhere.github.io/duco-statistics/statistics")
                .setDescription("Here are the latest statistics:")
                // Add fields for statistics data
                .setFooter("Statistics updated every 60 seconds", client.user.avatarURL())
                .setTimestamp();

            msg.edit(embed);
        };

        updateStatistics();
        const timer = setInterval(updateStatistics, 60 * 1000);

        if (message) {
            await message.channel.send("Stats started!");
        }
    } catch (error) {
        console.error("Error in start command:", error);
        if (message) {
            await message.channel.send("An error occurred while starting the statistics.");
        }
    }
};

module.exports.config = {
    name: "start",
    aliases: [],
    category: "admin",
    desc: "Start updating the statistics",
    usage: ""
};