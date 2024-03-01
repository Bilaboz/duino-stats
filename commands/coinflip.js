const { MessageEmbed } = require("discord.js");
const Profile = require("../models/profile");

module.exports.run = async (client, message, args, color) => {
    return message.channel.send(`**${message.author.username}**, this command is temporarily disabled`);

    // Commented out the return statement above to disable the command temporarily

    // const amount = parseInt(args[0]);
    // if (!amount || isNaN(amount) || amount <= 0) return message.channel.send("Please specify a valid number of coins to bet!");
    // if (amount < 20) return message.channel.send("Minimum number of coins to start a coinflip game is **20**");

    // let player1 = await Profile.findOne({
    //     userID: message.author.id,
    //     guildID: message.guild.id
    // });

    // if (!player1 || player1.coins < amount) {
    //     return message.channel.send(`**${message.author.username}**, you don't have enough coins to do this!`);
    // }

    // let gameEmbed = new MessageEmbed()
    //     .setAuthor(`${message.author.username}'s coinflip game`, message.author.avatarURL())
    //     .setColor("#2c9ef5")
    //     .setFooter(`${client.user.username} - There is no fee when you play against the bot`, client.user.avatarURL())
    //     .setTimestamp()
    //     .setDescription(`**${message.author.username}** has started a coinflip game of **${amount} coins**!\n
    //                     React with :coin: to play against them!\n
    //                     <@${message.author.id}>, if you don't want to wait, you can play against the bot by reacting with :robot:`);

    // const gameMessage = await message.channel.send(gameEmbed);
    // await gameMessage.react("🪙");
    // await gameMessage.react("🤖");

    // const sleep = (ms) => {
    //     return new Promise(resolve => setTimeout(resolve, ms));
    // };

    // const playGame = () => {
    //     const filter = (reaction, user) => {
    //         return (reaction.emoji.name === '🪙' && user.id !== message.author.id) || (reaction.emoji.name === '🤖' && user.id === message.author.id);
    //     };

    //     gameMessage.awaitReactions(filter, { time: 60000, max: 1 })
    //     .then(async (collected) => {
    //         const reaction = collected.first();
    //         const user2 = reaction.users.cache.last();

    //         // Game logic...

    //     })
    //     .catch((err) => { // if nobody reacted
    //         gameEmbed.setDescription(`**${message.author.username}**, your coinflip game has expired!`);
    //         gameMessage.edit(gameEmbed);
    //         gameMessage.reactions.removeAll();
    //     });
    // };

    // playGame();
};

module.exports.config = {
    name: "coinflip",
    aliases: ["cf"],
    desc: "Start a coinflip game against someone or the bot",
    usage: "<coins>",
    category: "economy"
};