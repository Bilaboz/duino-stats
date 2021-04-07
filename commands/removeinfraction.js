const Incident = require("../models/incident.js");
const { MessageEmbed } = require("discord.js");
const { getMember } = require("../utils/functions.js");

module.exports.run = async (client, message, args, color) => {
    if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send(":no_entry: You dont't have the permission to do that !");

    if (!args[1]) return message.channel.send("Please specify a user");

    let tUser = getMember(message, args[1]);
    if (tUser === -1) return;
    tUser = tUser.user;

    let target = parseInt(args[2])
    if (!target) return message.channel.send("Please specify a case number!");
    if (target < 0) return message.channel.send("No negative numbers");

    target -= 1;

    Incident.findOne({
        userID: tUser.id
    }, (err, query) => {
        if (err) console.log(err);

        if (!query) return message.channel.send(`**${tUser.username}** doesn't have any infractions!`);

        query.type.splice(target, 1);
        query.reason.splice(target, 1);
        query.moderator.splice(target, 1);
        query.time.splice(target, 1);
        query.count -= 1;

        query.save().catch(err => message.channel.send(err));

        const delEmbed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL())
            .setDescription(`Successfuly deleted case n°${target+1} for **${tUser.username}**`)
            .setColor(color.green)
            .setTimestamp();


        message.channel.send(delEmbed);
        client.channels.cache.get("699320187664728177").send(delEmbed);
    })

}

module.exports.config = {
    name: "delinf",
    aliases: ["deleteinfraction", "removeinf"],
    category: "moderation",
    usage: "<user> <case number>",
    desc: "Remove the specified infraction"
}