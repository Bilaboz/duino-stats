const Incident = require("../models/incident.js");
const { MessageEmbed } = require("discord.js");
const { getMember } = require("../utils/functions.js");

module.exports.run = async (client, message, args) => {

    if (!message.member.permissions.has("MANAGE_MESSAGES")) return message.channel.send(":no_entry: You don't have the permission to do that!");

    if (!args[1]) return message.channel.send("Please specify a user");

    let tUser = getMember(message, args[1]);
    if (!tUser) return message.channel.send("User not found!");
    tUser = tUser.user;

    try {
        const query = await Incident.findOne({ userID: tUser.id });
        if (!query) {
            return message.channel.send(`**${tUser.username}** doesn't have any infractions!`);
        }

        let finalstring = "";
        for (let i = 0; i < query.count; i++) {
            finalstring += `#${i + 1} - **Type**: ${query.type[i]}\n**Moderator**: ${query.moderator[i]} - **Date**: ${query.time[i]}\n**Reason**: ${query.reason[i]}\n\n`;
        }

        // Check if finalstring is too long
        if (finalstring.length > 2000) {
            const chunks = finalstring.match(/[\s\S]{1,2000}/g) || [];
            for (const chunk of chunks) {
                const embed = new MessageEmbed()
                    .setTitle(`List of infractions for ${tUser.username}`)
                    .setDescription(chunk)
                    .setTimestamp()
                    .setColor("#2160bf");
                message.channel.send(embed);
            }
        } else {
            const embed = new MessageEmbed()
                .setTitle(`List of infractions for ${tUser.username}`)
                .setDescription(finalstring)
                .setTimestamp()
                .setColor("#2160bf");
            message.channel.send(embed);
        }
    } catch (err) {
        console.error(err);
        message.channel.send("An error occurred while fetching the infractions.");
    }
};

module.exports.config = {
    name: "infractions",
    aliases: ["inf"],
    desc: "Show all the infractions of a user",
    usage: "<user>",
    category: "moderation"
};