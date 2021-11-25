const { MessageEmbed } = require("discord.js");
const Profile = require("../models/profile.js");
const { getMember } = require("../utils/functions.js")

module.exports.run = async (client, message, args, color) => {
    if (!args[1]) return message.channel.send("Please specify a user");

    let tUser = getMember(message, args[1]);
    if (tUser === -1) return;
    tUser = tUser.user;

    if (tUser.id == message.author.id) return message.channel.send("<:bruh:716749844504510526>");

    let amount = parseInt(args[2]);
    if (!amount) return message.channel.send("Please specify a number of coins to send!");
    if (amount < 0) return message.channel.send("You can't specify a negative amount of coins to send");

    if (args[3])
        if (args[3].toLowerCase() == "duco") {
        amount = amount * 100;
    }

    const user1 = await Profile.findOne({ userID: message.author.id, guildID: message.guild.id });
    const user2 = await Profile.findOne({ userID: tUser.id, guildID: message.guild.id });

    if (!user1) {
        const newProfile1 = new Profile({
            username: message.author.username,
            userID: message.author.id,
            guildID: message.guild.id,
            coins: 0,
            bumps: "0",
            xp: 0,
            level: 1
        })

        newProfile1.save().catch(err => message.channel.send(`Oops something went wrong ${err}`));
    }
    if (!user2) {
        const newProfile2 = new Profile({
            username: tUser.username,
            userID: tUser.id,
            guildID: message.guild.id,
            coins: 0,
            bumps: "0",
            xp: 0,
            level: 1
        })

        newProfile2.save().catch(err => message.channel.send(`Oops something went wrong ${err}`));
    }

    if (user1.coins < amount) {
        const noCoinsEmbed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL())
            .setColor(color.red)
            .setDescription(`**${message.author.username}**, you don't have enough coins to do this!`)
            .setFooter(client.user.username, client.user.avatarURL())
            .setTimestamp()

        return message.channel.send(noCoinsEmbed);
    }

    user1.coins -= amount;
    user2.coins += amount;
    
    user1.save().catch(err => message.channel.send(`Oops something went wrong ${err}`));
    user2.save().catch(err => message.channel.send(`Oops something went wrong ${err}`));

    const successEmbed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL())
        .setColor(color.green)
        .setFooter(client.user.username, client.user.avatarURL())
        .setTimestamp()
        .setDescription(`**${message.author.username}**, you sent **${amount}** bot coins (${amount/100} DUCO) to **${tUser.username}** <:true:709441577503817799>`)

    message.channel.send(successEmbed);
}

module.exports.config = {
    name: "pay",
    aliases: ["send"],
    desc: "Send to coins to someone",
    category: "economy",
    usage: "<user> <amount>"
}