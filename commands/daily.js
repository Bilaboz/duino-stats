const Profile = require("../models/profile.js");
const dayjs = require("dayjs");
const { MessageEmbed } = require("discord.js");

module.exports.run = async (client, message, args, color) => {

    const now = dayjs();

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
        dailyEmbed.setDescription(`**${message.author.username}** you successfully claimed your daily reward!\nYou got **10 bot coins** (0.1 DUCO) <:pepeclassy:701487042869329961>`);
        return message.channel.send(dailyEmbed);
    }
    
    if (query.level <= 1) {
        dailyEmbed.setDescription(`**${message.author.username}** you dont have a high enough level to do that`);
        return message.channel.send(dailyEmbed);
    }
    
    let coinAmount = Math.floor((Math.random() * 10) + 25);
    if (query.streak) coinAmount += query.streak * 1;

    let finalstring = `**${message.author.username}** you successfully claimed your daily reward!\nYou got **${coinAmount} bot coins (${coinAmount / 100} DUCO)** <:pepeclassy:701487042869329961>`;

    if (query.lastClaim) {
        const lastClaim = dayjs.unix(query.lastClaim);
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
