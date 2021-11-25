const Profile = require("../models/profile.js");
const{
    MessageEmbed
} = require("discord.js");
const api = "https://server.duinocoin.com/api.json";
const axios = require("axios");

module.exports.run = async(client, message, args, color) => {

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
        for (let i = 0; i < 5; i++) {
            if (i >= response.length)
                break; // in case if there is less than 5 entries

            if (i === 0) {
                finalstring = finalstring + `🏆 - **${response[i].username}** with ${response[i].bumps} bumps\n`;
            } else if (i === 1) {
                finalstring = finalstring + `🥈 - **${response[i].username}** with ${response[i].bumps} bumps\n`;
            } else if (i === 2) {
                finalstring = finalstring + `🥉 - **${response[i].username}** with ${response[i].bumps} bumps\n`;
            } else {
                finalstring = finalstring + `#${i+1} - **${response[i].username}** with ${response[i].bumps} bumps\n`;
            }
        }

        const lEmbed = new MessageEmbed()
            .setColor(color.green)
            .setTitle("Leaderboard of bumps")
            .setDescription(finalstring)
            .setTimestamp()

            message.channel.send(lEmbed);
    }

    if (args[1] === "coins") {
        const response = await Profile.find({
                guildID: message.guild.id
            }).sort({
                coins: -1
            }).limit(5);

        let finalstring = "";
        for (let i = 0; i < 5; i++) {
            if (i >= response.length)
                break;

            if (i === 0) {
                finalstring = finalstring + `🏆 - **${response[i].username}** with ${response[i].coins} bot coins (${response[i].coins/100} DUCO)\n`;
            } else if (i === 1) {
                finalstring = finalstring + `🥈 - **${response[i].username}** with ${response[i].coins} bot coins (${response[i].coins/100} DUCO)\n`;
            } else if (i === 2) {
                finalstring = finalstring + `🥉 - **${response[i].username}** with ${response[i].coins} bot coins (${response[i].coins/100} DUCO)\n`;
            } else {
                finalstring = finalstring + `#${i+1} - **${response[i].username}** with ${response[i].coins} bot coins (${response[i].coins/100} DUCO)\n`;
            }
        }

        const lEmbed = new MessageEmbed()
            .setColor(color.green)
            .setTitle(":moneybag: - Leaderboard of coins")
            .setDescription(finalstring)
            .setTimestamp()

            message.channel.send(lEmbed);
    }

    if (args[1] === "levels") {
        const response = await Profile.find({
                guildID: message.guild.id
            });

        const getSortOrder = (prop) => {
            return function (a, b) {
                if (a[prop] > b[prop]) {
                    return -1;
                } else if (a[prop] < b[prop]) {
                    return 1;
                }
                return 0;
            }
        }

        response.sort(getSortOrder("level"));

        let finalstring = "";
        for (let i = 0; i < 5; i++) {
            if (i >= response.length)
                break;

            if (i === 0) {
                finalstring = finalstring + `🏆 - **${response[i].username}** with ${response[i].level} levels\n`;
            } else if (i === 1) {
                finalstring = finalstring + `🥈 - **${response[i].username}** with ${response[i].level} levels\n`;
            } else if (i === 2) {
                finalstring = finalstring + `🥉 - **${response[i].username}** with ${response[i].level} levels\n`;
            } else {
                finalstring = finalstring + `#${i+1} - **${response[i].username}** with ${response[i].level} levels\n`;
            }
        }

        const lEmbed = new MessageEmbed()
            .setColor(color.green)
            .setTitle("Leaderboard of levels")
            .setDescription(finalstring)
            .setTimestamp()

            message.channel.send(lEmbed);
    }

    if (args[1] === "duco") {
        let response;
        try {
            response = await axios.get(api);
        } catch (err) {
            console.log(err);
            return message.channel.send("Can't fetch the data, the API is probably down <:why:677964669532504094>");
        }

        const richest = response.data["Top 10 richest miners"];
        const lastUp = response.data["Last update"];

        let finalstring = "";
        for (let i = 0; i < 10; i++) {
            if (i >= richest.length)
                break;

            if (i === 0) {
                finalstring = finalstring + `🏆 - **${richest[i]}**\n`;
            } else if (i === 1) {
                finalstring = finalstring + `🥈 - **${richest[i]}**\n`;
            } else if (i === 2) {
                finalstring = finalstring + `🥉 - **${richest[i]}**\n`;
            } else {
                finalstring = finalstring + `#${i+1} - ${richest[i]}\n`;
            }
        }

        finalstring += "Last update: " + lastUp;

        const lEmbed = new MessageEmbed()
            .setColor(color.green)
            .setTitle("Leaderboard of duco")
            .setDescription(finalstring)
            .attachFiles("https://server.duinocoin.com/balancechart.png")
            .setImage('attachment://balancechart.png')
            .setTimestamp()

            message.channel.send(lEmbed);
    }
}

module.exports.config = {
    name: "leaderboard",
    aliases: ["leader"],
    category: "economy",
    desc: "Display the leaderboard for the the specified element",
    usage: "(coins) (bumps) (levels)"
}
