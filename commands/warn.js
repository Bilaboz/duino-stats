const Incident = require("../models/incident.js");
const dayjs = require("dayjs");
const { MessageEmbed } = require("discord.js");
const { logChannelID } = require("../utils/config.json");
const { getMember } = require("../utils/functions.js");

dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));

module.exports.run = async (client, message, args, color) => {
    if (!message.member.hasPermission("MANAGE_MESSAGES")) {
        return message.channel.send(":no_entry: You don't have permission to do that!");
    }

    const tUser = getMember(message, args[1]);
    if (!tUser) {
        return message.channel.send("Please specify a valid user!");
    }
    if (tUser.user.bot) {
        return message.channel.send("You can't warn bots!");
    }
    if (tUser.hasPermission("MANAGE_MESSAGES")) {
        return message.channel.send("You can't warn a moderator!");
    }

    const reason = args.slice(2).join(" ");
    if (!reason) {
        return message.channel.send("Please provide a reason for the warning!");
    }

    const date = dayjs().tz("Europe/Paris").format('LLL');

    const promptEmbed = new MessageEmbed()
        .setAuthor(`Are you sure you want to warn ${tUser.user.username}?`)
        .setFooter("This prompt will automatically cancel after 30 seconds")
        .setColor(color.orange);

    const dmEmbed = new MessageEmbed()
        .setTitle("You have been warned")
        .addField("Reason", reason)
        .addField("Moderator", message.author.username)
        .addField("Date", date)
        .setColor("#ff5c5c")
        .setFooter("The date is UTC+2")
        .setTimestamp();

    const validReactions = ["✅", "❌"];
    const filter = (reaction, user) => validReactions.includes(reaction.emoji.name) && user.id === message.author.id;

    const msg = await message.channel.send(promptEmbed);
    validReactions.forEach(async (r) => await msg.react(r));

    msg.awaitReactions(filter, { time: 30000, max: 1 }).then(async collected => {
        if (!collected.first()) {
            msg.delete();
            return message.delete();
        }

        if (collected.first().emoji.name === "✅") {
            try {
                await tUser.send(dmEmbed);
            } catch (e) {
                message.channel.send(`I can't send a DM to ${tUser.user.username}, but I'll warn them anyway.`);
            }

            const newIncident = new Incident({
                username: tUser.user.username,
                userID: tUser.id,
                reason: reason,
                type: "Warn",
                moderator: message.author.username,
                time: date,
                count: 1
            });

            newIncident.save().catch(err => console.error("Error saving incident:", err));

            const warnEmbed = new MessageEmbed()
                .setTitle("New Warn")
                .setDescription(`**${tUser.user.username}** has been warned!`)
                .addField("Reason", reason)
                .addField("Moderator", message.author.username)
                .addField("Date", date)
                .setColor("#ff5c5c")
                .setFooter("The date is UTC+2")
                .setTimestamp();

            message.channel.send(warnEmbed);
            client.channels.cache.get(logChannelID).send(warnEmbed);
            msg.delete();
            message.delete();
        } else if (collected.first().emoji.name === "❌") {
            promptEmbed.setAuthor(`Warn cancelled`)
                .setFooter("This prompt was automatically cancelled after 30 seconds")
                .setColor(color.orange);

            msg.edit(promptEmbed);
        }
    });
};

module.exports.config = {
    name: "warn",
    aliases: [],
    usage: "<user> <reason>",
    category: "moderation",
    desc: "Warn the specified user"
};