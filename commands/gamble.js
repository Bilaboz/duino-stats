const Profile = require("../models/profile.js");
const { MessageEmbed } = require("discord.js");
const { randomInt } = require('crypto');

module.exports.run = async (client, message, args, color) => {

    const bet = parseInt(args[1]);
    if (!bet || isNaN(bet) || bet <= 0) {
        return message.channel.send("Please specify a positive number of coins to bet!");
    }

    const query = await Profile.findOne({ userID: message.author.id, guildID: message.guild.id });

    if (!query || query.coins < bet) {
        const noCoinsEmbed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL())
            .setColor(color.red)
            .setDescription(`**${message.author.username}**, you don't have enough coins to do this!`)
            .setFooter(client.user.username, client.user.avatarURL())
            .setTimestamp();

        return message.channel.send(noCoinsEmbed);
    }

    const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL())
        .setFooter(client.user.username, client.user.avatarURL())
        .setTimestamp();

    const roll = randomInt(100);
    if (roll < 46) {
        query.coins += bet;

        embed.setColor(color.green);
        embed.setDescription(`Yay! **${message.author.username}**, you **won** ${bet} coins!\nYou now have ${query.coins} coins.`);

        message.channel.send(embed);
    } else {
        query.coins -= bet;

        embed.setColor(color.red);
        embed.setDescription(`**${message.author.username}**, you **lost** ${bet} coins!\nYou now have ${query.coins} coins.`);

        message.channel.send(embed);
    }

    query.save().catch(err => message.channel.send(`Something went wrong: ${err}`));
};

module.exports.config = {
    name: "gamble",
    aliases: ["g", "bet"],
    category: "economy",
    desc: "Gamble the specified amount of coins",
    usage: "<coins>",
};