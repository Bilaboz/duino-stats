const Profile = require("../models/profile.js");
const { MessageEmbed } = require("discord.js");
const axios = require("axios");

const api = "https://server.duinocoin.com/api.json";

module.exports.run = async (client, message, args, color) => {

    if (!args[1]) {
        return message.channel.send("Please specify the leaderboard type: `duco`, `bumps`, `coins` or `levels`");
    }

    if (args[1] === "bumps") {
        const response = await Profile.find({
                guildID: message.guild.id
            }).sort({
                bumps: -1
            }).limit(5);

        let finalstring = "";
        for (let i = 0; i < response.length; i++) {
            const rankEmoji = ["🏆", "🥈", "🥉"];
            const rank = (i < 3) ? rankEmoji[i] : `#${i + 1}`;
            finalstring += `${rank} - **${response[i].username}** with ${response[i].bumps} bumps\n`;
        }

        const lEmbed = new MessageEmbed()
            .setColor(color.green)
            .setTitle("Leaderboard of bumps")
            .setDescription(finalstring)
            .setTimestamp();

        message.channel.send({ embeds: [lEmbed] });
    }

    if (args[1] === "coins") {
        const response = await Profile.find({
                guildID: message.guild.id
            }).sort({
                coins: -1
            }).limit(5);

        let finalstring = "";
        for (let i = 0; i < response.length; i++) {
            const rankEmoji = ["🏆", "🥈", "🥉"];
            const rank = (i < 3) ? rankEmoji[i] : `#${i + 1}`;
            finalstring += `${rank} - **${response[i].username}** with ${response[i].coins} bot coins (${response[i].coins / 100} DUCO)\n`;
        }

        const lEmbed = new MessageEmbed()
            .setColor(color.green)
            .setTitle(":moneybag: - Leaderboard of coins")
            .setDescription(finalstring)
            .setTimestamp();

        message.channel.send({ embeds: [lEmbed] });
    }

    if (args[1] === "levels") {
        const response = await Profile.find({
                guildID: message.guild.id
            }).sort({
                level: -1
            }).limit(5);

        let finalstring = "";
        for (let i = 0; i < response.length; i++) {
            const rankEmoji = ["🏆", "🥈", "🥉"];
            const rank = (i < 3) ? rankEmoji[i] : `#${i + 1}`;
            finalstring += `${rank} - **${response[i].username}** with ${response[i].level} levels\n`;
        }

        const lEmbed = new MessageEmbed()
            .setColor(color.green)
            .setTitle("Leaderboard of levels")
            .setDescription(finalstring)
            .setTimestamp();

        message.channel.send({ embeds: [lEmbed] });
    }

    if (args[1] === "duco") {
        try {
            const response = await axios.get(api);
            const richest = response.data["Top 10 richest miners"];
            const lastUp = response.data["Last update"];

            let finalstring = "";
            for (let i = 0; i < richest.length; i++) {
                const rankEmoji = ["🏆", "🥈", "🥉"];
                const rank = (i < 3) ? rankEmoji[i] : `#${i + 1}`;
                finalstring += `${rank} - **${richest[i]}**\n`;
            }

            finalstring += "Last update: " + lastUp;

            const lEmbed = new MessageEmbed()
                .setColor(color.green)
                .setTitle("Leaderboard of duco")
                .setDescription(finalstring)
                .attachFiles("https://server.duinocoin.com/balancechart.png")
                .setImage('attachment://balancechart.png')
                .setTimestamp();

            message.channel.send({ embeds: [lEmbed] });
        } catch (err) {
            console.log(err);
            return message.channel.send("Can't fetch the data, the API is probably down <:why:677964669532504094>");
        }
    }
};

module.exports.config = {
    name: "leaderboard",
    aliases: ["leader"],
    category: "economy",
    desc: "Display the leaderboard for the specified element",
    usage: "(coins) (bumps) (levels)"
};