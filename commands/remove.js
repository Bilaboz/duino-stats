const Profile = require("../models/profile.js");
const { getMember } = require("../utils/functions.js");

module.exports.run = async (client, message, args) => {
    // Check if the user has administrator permission
    if (!message.member.hasPermission("ADMINISTRATOR")) {
        return message.reply("You don't have permission to do this.");
    }

    // Check if a user and amount are specified
    if (!args[1] || !args[2]) {
        return message.channel.send("Please specify a user and an amount.");
    }

    // Get the target user
    let tUser = getMember(message, args[1]);
    if (tUser === -1) return;
    tUser = tUser.user;

    // Check if a valid user is specified
    if (!tUser) {
        return message.channel.send("Please specify a valid user.");
    }

    // Parse the amount and check if it's valid
    const amount = parseInt(args[2]);
    if (isNaN(amount) || amount < 0) {
        return message.channel.send("Please specify a valid amount.");
    }

    // Check if a valid type is specified
    const type = args[3]?.toLowerCase();
    if (!type || (type !== "bump" && type !== "bumps" && type !== "coin" && type !== "coins")) {
        return message.channel.send("Please specify a valid type (`bump(s)` or `coin(s)`).");
    }

    // Find the user's profile
    const query = await Profile.findOne({ userID: tUser.id, guildID: message.guild.id });

    // Check if the user has a profile
    if (!query) {
        return message.channel.send("This user doesn't have a profile.");
    }

    // Update the user's profile based on the specified type
    if (type === "bump" || type === "bumps") {
        query.bumps -= amount;
        message.channel.send(`Successfully removed ${amount} bump(s) from ${tUser.username}.`);
    } else if (type === "coin" || type === "coins") {
        query.coins -= amount;
        message.channel.send(`Successfully removed ${amount} coin(s) from ${tUser.username}.`);
    }

    // Save the changes to the profile
    query.save().catch(err => message.channel.send(`Something went wrong: ${err}`));
};

module.exports.config = {
    name: "remove",
    aliases: [],
    category: "admin",
    desc: "Remove coins/bumps from a user.",
    usage: "<user> <amount> <type>"
};