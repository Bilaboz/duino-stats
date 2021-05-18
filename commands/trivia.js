const { MessageEmbed } = require("discord.js");
const Profile = require("../models/profile.js");

module.exports.run = async (client, message, args, color) => {

    const coinsAmount = parseInt(args[1]);
    if (!coinsAmount) return message.channel.send("Please specify an amount of coin!");
    if (coinsAmount < 100) return message.channel.send(`The minimum amount of coins to start a trivia is 100!`);

    let toRetype = args.slice(2).join(" ");
    if (!toRetype) return message.channel.send("Please specify something to retype!");
    if (toRetype.length > 70) return message.reply(`Your message is too long!`);
    if (toRetype.split(" ").length <= 1) return message.channel.send("Please add at least 2 words");

    const noCoinsEmbed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL())
        .setColor(color.red)
        .setDescription(`**${message.author.username}**, you don't have enough coins to do this!`)
        .setFooter(client.user.username, client.user.avatarURL())
        .setTimestamp()

    const authorProfile = await Profile.findOne({ userID: message.author.id, guildID: message.guild.id });
    if (!authorProfile || authorProfile.coins < coinsAmount) {
        return message.channel.send(noCoinsEmbed);
    }

    message.delete();

    const obfuToRetype = `\`${toRetype.split(" ").join("\uFEFF ")}\``
    message.channel.send(`**🎉 Fast type event hosted by ${message.author.username}! 🎉**\n\nBe the first to retype the following sentence to win **${coinsAmount} coins**\nType: \`${obfuToRetype}\`\n*Copy paste will not work*`)

    const filter = m => m.author.id !== message.author.id && !m.author.bot;
    const collector = message.channel.createMessageCollector(filter, { time: 60000 });

    collector.on("collect", async (m) => {
        if (m.content === toRetype.split(" ").join("\uFEFF ")) {
            m.reply("No copy paste!");
        } else if (m.content === toRetype) {
            const winner = m.author;
            message.channel.send(`**${winner.username}** answered first!\nThey won **${coinsAmount} coins!** <:pepeclassy:701487042869329961>`);

            const winnerProfile = await Profile.findOne({ userID: winner.id, guildID: message.guild.id})
            if (!winnerProfile) {
                const newProfile = new Profile({
                    username: winner.username,
                    userID: winner.id,
                    guildID: message.guild.id,
                    coins: coinsAmount,
                    bumps: "0",
                    xp: 0,
                    level: 1
                })
                newProfile.save().catch(err => message.channel.send(`Something went wrong ${err}`));
            } else {
                winnerProfile.coins += coinsAmount;
                winnerProfile.save().catch(err => message.channel.send(`Something went wrong ${err}`));

                authorProfile.coins -= coinsAmount;
                authorProfile.save().catch(err => message.channel.send(`Something went wrong ${err}`));
            }
            collector.stop();
        }
    });

    collector.on("end", () => {
        const resultFilter = m => m.content === toRetype;
        if (!collector.collected.find(resultFilter)) {
            message.channel.send("Nobody answered, *sad*");
        }
    })
}

module.exports.config = {
    name: "trivia",
    aliases: [],
    desc: "Start a trivia",
    usage: "<amount of coins> <to retype>",
    category: "economy"
}
