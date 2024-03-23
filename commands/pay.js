const { MessageEmbed } = require("discord.js");
const Profile = require("../models/profile.js");
const { getMember } = require("../utils/functions.js");

module.exports.run = async (client, message, args, color) => {
    // Check if a user is mentioned
    if (!args[1]) return message.channel.send("Please specify a user");

    // Get the mentioned user
    let tUser = getMember(message, args[1]);
    if (tUser === -1) return;

    // Avoid self-payment
    if (tUser.id === message.author.id) return message.channel.send("You can't pay yourself!");

    // Parse the amount to be paid
    let amount = parseInt(args[2]);
    if (!amount || amount <= 0) return message.channel.send("Please specify a valid positive amount of coins to send");

    // Convert to DUCO if specified
    if (args[3] && args[3].toLowerCase() === "duco") {
        amount *= 100;
    }

    // Find the profiles of sender and receiver
    const senderProfile = await Profile.findOne({ userID: message.author.id, guildID: message.guild.id }) || createProfile(message.author);
    const receiverProfile = await Profile.findOne({ userID: tUser.id, guildID: message.guild.id }) || createProfile(tUser);

    // Check if the sender has enough coins
    if (senderProfile.coins < amount) {
        return message.channel.send(`You don't have enough coins to send **${amount}** bot coins`);
    }

    // Update sender and receiver balances
    senderProfile.coins -= amount;
    receiverProfile.coins += amount;
    await senderProfile.save();
    await receiverProfile.save();

    // Send success message
    const successEmbed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL())
        .setColor(color.green)
        .setDescription(`Successfully sent **${amount}** bot coins (${amount / 100} DUCO) to **${tUser.username}**`)
        .setTimestamp();

    message.channel.send(successEmbed);

    // Function to create a new profile if not exists
    function createProfile(user) {
        const newProfile = new Profile({
            username: user.username,
            userID: user.id,
            guildID: message.guild.id,
            coins: 0,
            bumps: 0,
            xp: 0,
            level: 1
        });
        return newProfile.save();
    }
};

module.exports.config = {
    name: "pay",
    aliases: ["send"],
    desc: "Send coins to someone",
    category: "economy",
    usage: "<user> <amount> [duco]",
};