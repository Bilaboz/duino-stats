const Profile = require("../models/profile.js");
const { getMember } = require("../utils/functions.js");

module.exports.run = async (client, message, args) => {
    if(!message.member.hasPermission("ADMINISTRATOR")) return message.reply("<https://www.youtube.com/watch?v=dQw4w9WgXcQ>");

    if (!args[1]) return message.channel.send("Please specify a user");

    let tUser = getMember(message, args[1]);
    if (tUser === -1) return;
    tUser = tUser.user;

    if (!tUser) return message.channel.send("Please specify a user");

    const amount = parseInt(args[2]);
    if (!amount) return message.channel.send("Please specify desired amount to remove");
    if (amount < 0) return message.channel.send("Don't specify negative numbers. Use !add instead");

    const validTypes = ["bump", "bumps", "coin", "coins"];

    const type = args[3];
    if (!type || !validTypes.includes(args[3])) return message.channel.send("Please specify what do you want to remove (`bump(s)` or `coin(s)`)");

    const query = await Profile.findOne({ userID: tUser.id, guildID: message.guild.id });

    if (type === "bump" || type === "bumps") {
        if (!query) {
            message.channel.send(`This poor guy doesn't even have a profile, leave him alone`);
        } else {
            query.bumps -= amount;
            query.save().catch(err => message.channel.send(`Something went wrong ${err}`));
            message.channel.send(`Successfully removed **${amount}** from to **${tUser.username}**`);
        }
    } else if (type === "coin" || type === "coins") {
        if (!query) {
            message.channel.send(`This poor guy doesn't even have a profile, leave him alone`);
        } else {
            query.coins -= amount;
            query.save().catch(err => message.channel.send(`Something went wrong ${err}`));
            message.channel.send(`Successfully removed **${amount}** coins from **${tUser.username}**`);
        }
    }
}

module.exports.config = {
    name: "remove",
    aliases: [],
    category: "admin",
    desc: "Remove coins/bumps from a user",
    usage: "<user> <amount> <type>"
}