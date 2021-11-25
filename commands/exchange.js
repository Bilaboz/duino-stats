const Profile = require("../models/profile.js");
const { MessageEmbed } = require("discord.js");
const net = require("net");
const axios = require("axios");

const { logChannelID } = require("../utils/config.json");

module.exports.run = async (client, message, args, color) => {
    const amount = parseInt(args[1]);
    if (!amount) return message.channel.send("Please specify desired amount of bot coins to exchange");
    if (amount < 100) return message.channel.send("Minimum exchangeable amount is 100 bot coins (1 DUCO)");

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

    const send_url = `https://server.duinocoin.com/transaction/`
                    + `?username=coinexchange`
                    + `&password=` + encodeURIComponent(process.env.coinexchangePassword)
                    + `&recipient=` + encodeURIComponent(ducoUsername)
                    + `&amount=` + encodeURIComponent(ducoAmount)
                    + `&memo=Bot coins to DUCO exchange`;
    
    try {
        let response = await axios.get(send_url);
        response = response.data;
        if (response["success"]) {
            let txid = response["result"].split(",")[2];

            embed.setColor(color.green)
            embed.setDescription(`Successfully exchanged **${amount} coins** to **${ducoAmount} DUCO** and sent to **${ducoUsername}**
                                 [View transaction in the explorer](https://explorer.duinocoin.com?search=${txid})`)
            msg.edit(embed);

            client.channels.cache
                .get(logChannelID)
                .send(`<@!${message.author.id}> exchanged **${amount} coins** to account **${ducoUsername}**`);
        }
        else {
            console.log(response);
            query.coins += amount;
            query.save().catch(err => message.channel.send(`Something went wrong ${err}`));
            
            let err_msg = response["message"].split(",")[1];
            
            embed.setDescription(`Error exchanging **${amount}** coins\n${err_msg}`);
            msg.edit(embed);
        }
    } catch (err) {
        console.log(err);
        
        query.coins += amount;
        query.save().catch(err => message.channel.send(`Something went wrong ${err}`));
        
        embed.setDescription(`Error exchanging **${amount}** coins\n${err}`);
        msg.edit(embed);
    }
}
    

module.exports.config = {
    name: "exchange",
    aliases: ["withdraw"],
    category: "economy",
    desc: "Exchange bot coins to DUCO",
    usage: "<amount> <duco username>"
}
