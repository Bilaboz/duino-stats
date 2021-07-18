const Profile = require("../models/profile.js");
const { MessageEmbed } = require("discord.js");
const net = require("net");

const { logChannelID } = require("../utils/config.json");

module.exports.run = async (client, message, args, color) => {
    const amount = parseInt(args[1]);
    if (!amount) return message.channel.send("Please specify desired amount of bot coins to exchange");
    if (amount < 100) return message.channel.send("Minimum exchangeable amount is 100 bot coins");

    const ducoUsername = args[2];
    if (!ducoUsername) return message.channel.send("Please specify your Duino-Coin username");
    if (ducoUsername.includes(",")) return message.channel.send("Please send a valid Duino-Coin username");

    const ducoAmount = Math.round(amount) / 100;

    const query = await Profile.findOne({ userID: message.author.id, guildID: message.guild.id });

    if (!query) {
        const newProfile = new Profile({
            username: message.author.username,
            userID: message.author.id,
            guildID: message.guild.id,
            coins: 0,
            bumps: 0,
            xp: 0,
            level: 1
        })
        newProfile.save().catch(err => message.channel.send(`Something went wrong ${err}`));
        return message.channel.send(noCoinsEmbed);
    }

    const noCoinsEmbed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL())
        .setColor(color.red)
        .setDescription(`**${message.author.username}**, you don't have enough coins to do this!`)
        .setFooter(client.user.username, client.user.avatarURL())
        .setTimestamp()

    if (query.coins < amount) {
        return message.channel.send(noCoinsEmbed);
    }

    query.coins -= amount; // to prevent abuse
    query.save().catch(err => message.channel.send(`Something went wrong ${err}`));

    const embed = new MessageEmbed()
        .setColor(color.orange)
        .setDescription("**Exchanging in progress** - this will take a minute at most...")
        .setTimestamp()
        .setAuthor(message.author.username, message.author.avatarURL())
        .setFooter(client.user.username, client.user.avatarURL())

    const msg = await message.channel.send(embed);

    const socket = new net.Socket();
    socket.setEncoding('utf8');
    socket.connect(2809, "127.0.0.1");

    socket.on("error", (error) => {
        console.log("socket error in exchange command: " + error);
        query.coins += amount;
        query.save().catch(err => message.channel.send(`Something went wrong ${err}`));

        message.reply(`An error occured while exchanging your coins: ${error}`);
    })

    socket.on("data", (data) => {
        if (data.startsWith("2")) {
            socket.write(`LOGI,coinexchange,${process.env.coinexchangePassword}`);
        } else if (data.includes("Successfully")) {
            const txid = data.split(",")[2];

            embed.setColor(color.green)
            embed.setDescription(`Successfully exchanged **${amount} coins** to **${ducoAmount} DUCO** and sent to **${ducoUsername}**
                                [View transaction in the explorer](https://explorer.duinocoin.com?search=${txid})`)

            msg.edit(embed);

            client.channels.cache
                .get(logChannelID)
                .send(`<@!${message.author.id}> exchanged **${amount} coins** to account **${ducoUsername}**`);
        } else if (data === "OK") {
            socket.write(`SEND,Bot coins to DUCO exchange,${ducoUsername},${ducoAmount}`);
        } else {
            query.coins += amount;
            query.save().catch(err => message.channel.send(`Something went wrong ${err}`));

            embed.setColor(color.red)

            try {
                const error = data.split(",")[1];

                embed.setDescription(`Error exchanging **${amount}** coins\n${error}`);

                msg.edit(embed);
            } catch (err) {
                embed.setDescription(`Error exchanging **${amount}** coins\n${err}`);

                msg.edit(embed);
            }
        }
    })
}
    

module.exports.config = {
    name: "exchange",
    aliases: ["withdraw"],
    category: "economy",
    desc: "Exchange bot coins to DUCO",
    usage: "<amount> <duco username>"
}
