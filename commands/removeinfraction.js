const Incident = require("../models/incident.js");
const { MessageEmbed } = require("discord.js");

const { logChannelID } = require("../utils/config.json");
const { getMember } = require("../utils/functions.js");

module.exports.run = async (client, message, args, color) => {
    // Check if the user has the required permission
    if (!message.member.hasPermission("MANAGE_MESSAGES")) {
        return message.channel.send(":no_entry: You don't have permission to do that.");
    }

    // Check if a user is specified
    if (!args[1]) {
        return message.channel.send("Please specify a user.");
    }

    // Get the target user
    let tUser = getMember(message, args[1]);
    if (tUser === -1) return;
    tUser = tUser.user;

    // Check if a valid case number is specified
    let target = parseInt(args[2]);
    if (!target || isNaN(target) || target < 1) {
        return message.channel.send("Please specify a valid case number.");
    }

    // Adjust the target to match array indexing
    target -= 1;

    // Find the infraction for the target user
    Incident.findOne({ userID: tUser.id }, (err, query) => {
        if (err) {
            console.log(err);
            return message.channel.send("An error occurred while processing the request.");
        }

        // Check if the user has any infractions
        if (!query) {
            return message.channel.send(`**${tUser.username}** doesn't have any infractions.`);
        }

        // Check if the specified case number is valid
        if (target >= query.type.length) {
            return message.channel.send(`Case number ${target + 1} does not exist for **${tUser.username}**.`);
        }

        // Remove the specified infraction
        query.type.splice(target, 1);
        query.reason.splice(target, 1);
        query.moderator.splice(target, 1);
        query.time.splice(target, 1);
        query.count -= 1;

        // Save the changes to the database
        query.save().catch(err => {
            console.log(err);
            return message.channel.send("An error occurred while saving the changes.");
        });

        // Send confirmation message
        const delEmbed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL())
            .setDescription(`Successfully deleted case number ${target + 1} for **${tUser.username}**`)
            .setColor(color.green)
            .setTimestamp();

        message.channel.send(delEmbed);
        client.channels.cache.get(logChannelID).send(delEmbed);
    });
};

module.exports.config = {
    name: "delinf",
    aliases: ["deleteinfraction", "removeinf"],
    category: "moderation",
    usage: "<user> <case number>",
    desc: "Remove the specified infraction."
};