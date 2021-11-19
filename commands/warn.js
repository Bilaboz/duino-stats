const Incident = require("../models/incident.js");
const dayjs = require("dayjs");
const { MessageEmbed } = require("discord.js");

const { logChannelID } = require("../utils/config.json");
const { getMember } = require("../utils/functions.js");

dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));

module.exports.run = async (client, message, args, color) => {

    if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send(":no_entry: You dont't have the permission to do that !")
    
    if (!args[1]) return message.channel.send("Please specify a user");

    let tUser = getMember(message, args[1]);
    if (tUser === -1) return;
    tUser = tUser.user;

    if (!tUser) return message.channel.send("Please specify a user");
    if (tUser == message.author) return message.channel.send("You can't warn yourself");

    let reason = args.slice(2).join(" ");
    if (!reason) reason = "No reason specified";

    const date = dayjs().tz("Europe/Paris").format('LLL');

    const promptEmbed = new MessageEmbed()
        .setAuthor(`Are you sure that you want to warn ${tUser.username}?`)
        .setFooter("Auto cancelled after 30 seconds")
        .setColor(color.orange)

    const dmEmbed = new MessageEmbed()
        .setTitle("You have been warned")
        .addField("Reason", reason)
        .addField("Moderator", message.author.username)
        .addField("Date", date)
        .setColor("#ff5c5c")
        .setFooter("The date is UTC+2")
        .setTimestamp()

    const validReactions = ["✅", "❌"];
    const filter = (reaction, user) => validReactions.includes(reaction.emoji.name) && user.id === message.author.id;

    const msg = await message.channel.send(promptEmbed);
    validReactions.forEach(async (r) => await msg.react(r));

    msg.awaitReactions(filter, { time: 30000, max: 1 }).then(async collected => {
        if(!collected.first()) {
            msg.delete();
            return message.delete();
        }

        if (collected.first().emoji.name === "✅") {
            try {
                await tUser.send(dmEmbed);
            } catch (e) {
                message.channel.send(`I can't send a DM to ${tUser.username}, but I warn him anyway`)
            }
        
            Incident.findOne({
                userID: tUser.id
            }, (err, query) => {
                if (err) console.log(err);

                if (!query) {
                    const newIncident = new Incident({
                        username: tUser.username,
                        userID: tUser.id,
                        reason: reason,
                        type: "Warn",
                        moderator: message.author.username,
                        time: date,
                        count: 1
                    })
        
                    newIncident.save().catch(err => message.channel.send(err));
                } else {
                    query.reason.push(reason);
                    query.moderator.push(message.author.username);
                    query.time.push(date);
                    query.type.push("Warn");
                    query.count += 1;
        
                    query.save().catch(err => message.channel.send(err));
                }
            })
        
            const warnEmbed = new MessageEmbed()
                .setTitle("New warn")
                .setDescription(`**${tUser.username}** has been warned!`)
                .addField("Reason", reason)
                .addField("Moderator", message.author.username)
                .addField("Date", date)
                .setColor("#ff5c5c")
                .setFooter("The date is UTC+2")
                .setTimestamp()
            
            message.channel.send(warnEmbed);
            client.channels.cache.get(logChannelID).send(warnEmbed);
            msg.delete();
            message.delete();
        } else if (collected.first().emoji.name === "❌") {
            promptEmbed.setAuthor(`Warn cancelled`)
                .setFooter("Automatically cancelled after 30 seconds")
                .setColor(color.orange)

            msg.edit(promptEmbed);
        }
    })
}

module.exports.config = {
    name: "warn",
    aliases: [],
    usage: "<user> <reason>",
    category: "moderation",
    desc: "Warn the user"
}