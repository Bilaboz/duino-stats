const Profile = require("../models/profile.js");
const { getMember } = require("../utils/functions.js");
const { MessageEmbed } = require("discord.js");

module.exports.run = async (client, message, args) => {
    if (!message.member.permissions.has("ADMINISTRATOR")) {
        const rickEmbed = new MessageEmbed()
            .setDescription("Click [here](https://www.youtube.com/watch?v=dQw4w9WgXcQ) to claim your free coins")
            .setAuthor(message.author.username, message.author.avatarURL())
            .setTimestamp();
        
        return message.channel.send({ embeds: [rickEmbed] });
    }

    if (!args[1]) return message.channel.send("Please specify a user");

    let tUser = getMember(message, args[1]);
    if (tUser === -1) return;
    tUser = tUser.user;

    const amount = parseInt(args[2]);
    if (!amount) return message.channel.send("Please specify the desired amount to add");
    if (amount < 0) return message.channel.send("Please specify a positive number. Use !remove instead");

    const validTypes = ["bump", "bumps", "coin", "coins"];
    
    const type = args[3];
    if (!type || !validTypes.includes(args[3])) return message.channel.send("Please specify what you want to add (`bump(s)` or `coin(s)`)");

    let query = await Profile.findOne({
        userID: tUser.id,
        guildID: message.guild.id
    });

    if (!query) {
        query = new Profile({
            username: tUser.username,
            userID: tUser.id,
            guildID: message.guild.id,
            coins: 0,
            bumps: 0,
            xp: 0,
            level: 1
        });
    }

    if (type === "bump" || type === "bumps") {
        query.bumps += amount;
        await query.save();
        message.channel.send(`Successfully added ${amount} bump(s) to **${tUser.username}**`);
    } else if (type === "coin" || type === "coins") {
        query.coins += amount;
        await query.save();
        message.channel.send(`Successfully added ${amount} coin(s) to **${tUser.username}**`);
    }
};

module.exports.config = {
    name: "add",
    aliases: [],
    category: "admin",
    desc: "Add coins/bumps to a user",
    usage: "<user> <amount> <type>"
};