const Profile = require("../models/profile.js");
const { getMember } = require("../utils/functions.js");
const { MessageEmbed } = require("discord.js");

module.exports.run = async (client, message, args) => {
    if (!message.member.hasPermission("ADMINISTRATOR")) {
        const rickEmbed = new MessageEmbed()
            .setDescription("Click [here](https://www.youtube.com/watch?v=dQw4w9WgXcQ) to claim your free coins")
            .setAuthor(message.author.username, message.author.avatarURL())
            .setTimestamp()
        
        return message.channel.send(rickEmbed)
    }

    if (!args[1]) return message.channel.send("Please specify a user");

    let tUser = getMember(message, args[1]);
    if (tUser === -1) return;
    tUser = tUser.user;

    const amount = parseInt(args[2]);
    if (!amount) return message.channel.send("Please specify desired amount to add");
    if (amount < 0) return message.channel.send("Don't specify zero or negative numbers. Use !remove instead");

    const validTypes = ["bump", "bumps", "coin", "coins"];
    
    const type = args[3];
    if (!type || !validTypes.includes(args[3])) return message.channel.send("Please specify what do you want to add (`bump(s)` or `coin(s)`)");

    const query = await Profile.findOne({
        userID: tUser.id,
        guildID: message.guild.id
    });

    if (type === "bump" || type === "bumps") {
        if (!query) {
            const newProfile = new Profile({
                username: tUser.username,
                userID: tUser.id,
                guildID: message.guild.id,
                coins: 0,
                bumps: amount,
                xp: 0,
                level: 1 
            })

            newProfile.save().catch(err => message.channel.send(`Something went wrong ${err}`));
            message.channel.send(`Successfully added ${amount} bumps to **${tUser.username}**`);
        } else {
            query.bumps += amount;
            query.save().catch(err => message.channel.send(`Something went wrong ${err}`));
            message.channel.send(`Successfully added ${amount} bumps to **${tUser.username}**`);
        }
    } else if (type === "coin" || type === "coins") {
        if (!query) {
            const newProfile = new Profile({
                username: tUser.username,
                userID: tUser.id,
                guildID: message.guild.id,
                coins: amount,
                bumps: 0,
                xp: 0,
                level: 1
            })

            newProfile.save().catch(err => message.channel.send(`Something went wrong ${err}`));
            message.channel.send(`Successfully added **${amount}** coins to **${tUser.username}**`);
        } else {
            query.coins += amount;
            query.save().catch(err => message.channel.send(`Something went wrong ${err}`));
            message.channel.send(`Successfully added **${amount}** coins to **${tUser.username}**`);
        }
    }
}

module.exports.config = {
    name: "add",
    aliases: [],
    category: "admin",
    desc: "Add coins/bumps from a user",
    usage: "<user> <amount> <type>"
}