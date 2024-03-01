const { MessageEmbed } = require("discord.js");
const dayjs = require("dayjs");

const Incident = require("../models/incident.js");
const { getMember } = require("../utils/functions.js");
const { logChannelID } = require("../utils/config.json");

dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));

module.exports.run = async (client, message, args, color) => {

    if (!message.member.permissions.has("KICK_MEMBERS")) return message.channel.send(":no_entry: You don't have the permission to do that!");

    if (!args[1]) return message.channel.send("Please specify a user");

    let tUser = getMember(message, args[1]);
    if (!tUser) return message.channel.send("User not found!");
    const guildedUser = tUser;
    tUser = tUser.user;

    if (tUser.id === message.author.id) return message.channel.send("You can't kick yourself");
    if (guildedUser.permissions.has("ADMINISTRATOR")) return message.channel.send("You can't kick an administrator");

    let reason = args.slice(2).join(" ");
    if (!reason) reason = "No reason specified";

    const date = dayjs().tz("Europe/Paris").format('LLL');

    const promptEmbed = new MessageEmbed()
        .setAuthor(`Are you sure that you want to kick ${tUser.username}?`)
        .setFooter("Automatically canceled after 30 seconds")
        .setColor(color.orange);

    const dmEmbed = new MessageEmbed()
        .setTitle("You have been kicked from Duino-Coin!")
        .addField("Reason", reason)
        .addField("Moderator", message.author.username)
        .addField("Date", date)
        .setColor("#ff5c5c")
        .setFooter("The date is UTC+2")
        .setTimestamp();

    const validReactions = ["✅", "❌"];
    const filter = (reaction, user) => validReactions.includes(reaction.emoji.name) && user.id === message.author.id;

    const msg = await message.channel.send({ embeds: [promptEmbed] });
    validReactions.forEach(async (r) => await msg.react(r));

    msg.awaitReactions({ filter, time: 30000, max: 1 }).then(async collected => {
        if (!collected.first()) {
            msg.delete();
            return message.delete();
        }

        if (collected.first().emoji.name === "✅") {
            try {
                await tUser.send({ embeds: [dmEmbed] });
            } catch (e) {
                message.channel.send(`I can't send a DM to ${tUser.username}, but I warn him anyway`);
            }

            try {
                await guildedUser.kick(reason);
            } catch (err) {
                return message.channel.send(`Couldn't kick **${tUser.username}**: ${err}`);
            }

            try {
                let query = await Incident.findOne({ userID: tUser.id });
                if (!query) {
                    query = new Incident({
                        username: tUser.username,
                        userID: tUser.id,
                        reason: [reason],
                        type: ["Kick"],
                        moderator: [message.author.username],
                        time: [date],
                        count: 1
                    });
                } else {
                    query.reason.push(reason);
                    query.moderator.push(message.author.username);
                    query.time.push(date);
                    query.type.push("Kick");
                    query.count += 1;
                }
                await query.save();
            } catch (err) {
                return message.channel.send(`An error occurred while saving the incident: ${err}`);
            }

            const kickEmbed = new MessageEmbed()
                .setTitle("New kick")
                .setDescription(`**${tUser.username}** has been kicked!`)
                .addField("Reason", reason)
                .addField("Moderator", message.author.username)
                .addField("Date", date)
                .setColor("#ff5c5c")
                .setFooter("The date is UTC+2")
                .setTimestamp();

            message.channel.send({ embeds: [kickEmbed] });
            client.channels.cache.get(logChannelID).send({ embeds: [kickEmbed] });
            msg.delete();
            message.delete();
        } else if (collected.first().emoji.name === "❌") {
            promptEmbed.setAuthor(`Kick cancelled`)
                .setFooter("Automatically cancelled after 30 seconds")
                .setColor(color.orange);

            msg.edit({ embeds: [promptEmbed] });
        }
    });
};

module.exports.config = {
    name: "kick",
    aliases: [],
    usage: "<user> <reason>",
    category: "moderation",
    desc: "Kick the user"
};