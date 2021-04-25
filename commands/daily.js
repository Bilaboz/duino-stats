const Profile = require("../models/profile.js");
const moment = require("moment");
const { MessageEmbed } = require("discord.js");

module.exports.run = async (client, message, args, color) => {

    const now = moment();

    const dailyEmbed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL())
        .setColor("#52ff57")
        .setFooter(client.user.username, client.user.avatarURL())
        .setTimestamp()

    const query = await Profile.findOne({
        userID: message.author.id,
        guildID: message.guild.id
    })

    if (!query) {
        const newProfile = new Profile({
            username: message.author.username,
            userID: message.author.id,
            guildID: message.guild.id,
            coins: 100,
            bumps: "0",
            xp: 0,
            level: 1,
            lastClaim: now.unix(),
            streak: 0
        })

        newProfile.save().catch(err => message.channel.send(`Oops something went wrong ${err} lmao`));
        dailyEmbed.setDescription(`**${message.author.username}** you successfully claimed your daily reward!\nYou got **100 bot coins** <:pepeclassy:701487042869329961>`);
        return message.channel.send(dailyEmbed);
    }

    let coinAmount = Math.floor((Math.random() * 30) + 65);
    if (query.streak) coinAmount += query.streak * 0.5;

    let finalstring = `**${message.author.username}** you successfully claimed your daily reward!\nYou got **${coinAmount} bot coins** <:pepeclassy:701487042869329961>`;

    if (query.lastClaim) {
        const lastClaim = moment.unix(query.lastClaim);
        const difference = now.diff(lastClaim, "hours");

        if (difference >= 24) {
            if (!query.streak) query.streak = 0;

            if (difference >= 48) {
                finalstring += `\nYou lost your daily streak of **${query.streak}** ❌`;
                query.streak = 0;
            } else {
                query.streak += 1;
                finalstring += `\nYour daily streak is now **${query.streak}**!`;
            }

            query.coins += coinAmount;
            query.lastClaim = now.unix();
            query.save().catch(err => message.channel.send(`Oops something went wrong ${err} lmao`));

            dailyEmbed.setDescription(finalstring);
            message.channel.send(dailyEmbed);
        } else {
            dailyEmbed.setColor(color.red);
            dailyEmbed.setDescription(`**${message.author.username}** you will be able to claim your daily reward in ${24 - (now.diff(lastClaim, "hours"))} hours`);

            message.channel.send(dailyEmbed)
        }
    } else {
        query.streak = 0;
        query.coins += coinAmount;
        query.lastClaim = now.unix();
        query.save().catch(err => message.channel.send(`Oops something went wrong ${err}`));

        dailyEmbed.setDescription(finalstring);
        message.channel.send(dailyEmbed);
    }
}

module.exports.config = {
    name: "daily",
    aliases: [],
    category: "economy",
    desc: "Claim your daily reward",
    usage: ""
}
