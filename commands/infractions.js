const Incident = require("../models/incident.js");
const { MessageEmbed } = require("discord.js");
const { getMember } = require("../utils/functions.js");

module.exports.run = async (client, message, args) => {

    if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send(":no_entry: You dont't have the permission to do that !");

    if (!args[1]) return message.channel.send("Please specify a user");
    
    let tUser = getMember(message, args[1]);
    if (tUser === -1) return;
    tUser = tUser.user;

    const query = await Incident.findOne({ userID: tUser.id });
    if (!query) {
        return message.channel.send(`**${tUser.username}** doesn't have any infractions !`);
    }

    let finalstring = "";
    for (let i = 0; i < query.count; i++) {
        finalstring += `#${i+1} - **Type**: ${query.type[i]}\n**Moderator**: ${query.moderator[i]} - **Date**: ${query.time[i]}\n**Reason**: ${query.reason[i]}\n\n`
    }


    // ------ hacky fix ----- //

    if (finalstring.length > 2000) {
        finalstring = [finalstring.substring(0,2000), finalstring.substring(2000)];
    } else if (finalstring.length > 4000) {
        finalstring = [finalstring.substring(0,2000), finalstring.substring(2000),finalstring.substring(2000,4000), finalstring.substring(4000)];
    } else {
        finalstring = [finalstring];
    }

    finalstring.forEach(chunk => {
        const embed = new MessageEmbed()
            .setTitle(`List of infractions for ${tUser.username}`)
            .setDescription(chunk)
            .setTimestamp()
            .setColor("#2160bf")
    
        message.channel.send(embed)
    })
}

module.exports.config = {
    name: "infractions",
    aliases: ["inf"],
    desc: "Show all the infractions of a user",
    usage: "<user>",
    category: "moderation"
}