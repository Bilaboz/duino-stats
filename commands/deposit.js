const { MessageEmbed } = require("discord.js");
const axios = require("axios");
const Profile = require("../models/profile.js");
const moment = require("moment");
const balanceApi = "http://51.15.127.80/balances.json";
const transactionsApi = "http://51.15.127.80/transactions.json";

let cooldown = new Set();
let alreadyUsedTxid = new Set();

module.exports.run = async (client, message, args, color) => {
    const ducoAmount = parseFloat(args[1]);
    if (!ducoAmount) return message.channel.send("Please specify a number of DUCO to deposit");
    if (ducoAmount <= 0) return message.channel.send("Please specify a positive number of DUCO to deposit");
    if (ducoAmount < 1.5) return message.channel.send("The minimum amount of DUCO to deposit is 1.5");

    const coinAmount = parseInt((ducoAmount * 100) / 1.5);

    const username = args[2];
    if (!username) return message.channel.send("Please specify your Duino-Coin username");


    const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL())
        .setFooter("Automatically canceled after 30 seconds", client.user.avatarURL())
        .setTimestamp()
        .setColor(color.orange)
        .setDescription(`Are you sure that you want to exchange **${ducoAmount}** <:duco:807188450393980958> to **${coinAmount} coins**?`)
        
    const msg = await message.channel.send(embed);

    const validReactions = ["✅", "❌"];
    validReactions.forEach(async (r) => await msg.react(r));

    const filter = (reaction, user) => validReactions.includes(reaction.emoji.name) && user.id === message.author.id;
    const collected = await msg.awaitReactions(filter, { time: 30000, max: 1 });

    if (!collected.first() || collected.first().emoji.name === "❌") {
        embed.setDescription("Deposit request cancelled");
        embed.setColor(color.red);
        msg.reactions.removeAll();
        return msg.edit(embed);
    }

    embed.setDescription("Deposit procedure started!\nPlease wait...");
    embed.setFooter(client.user.username, client.user.avatarURL());
    msg.edit(embed);
    msg.reactions.removeAll();

    const balanceApiResponse = await axios.get(balanceApi);
    if (!balanceApiResponse.data) {
        embed.setColor(color.red);
        embed.setDescription("`ERROR`: Impossible to fetch the balances API.");
        return msg.edit(embed);
    }

    const ducoBalance = parseFloat(balanceApiResponse.data[username]);
    if (!ducoBalance || ducoBalance < ducoAmount) {
        embed.setColor(color.red);
        embed.setDescription(`\`ERROR\`: The specifed username isn't listed in the API or doesn't have enough balance to exchange ${ducoAmount} <:duco:807188450393980958>`);
        return msg.edit(embed);
    }

    if (cooldown.has(message.author.id)) {
        message.channel.send(`**${message.author.username}** you can deposit funds every 10 mins!`);
        return;
    } else {
        cooldown.add(message.author.id)
        setTimeout(() => {
            cooldown.delete(message.author.id)
        }, 600000)
    }

    const before = moment();

    embed.setDescription(`**${message.author.username}**, please send exactly \`${ducoAmount}\` DUCO to \`coinexchange\`
                        You have \`6 minutes\` to send the funds
                        When you sent them, get the transaction ID. **You can find it [here](https://explorer.duinocoin.com/)** (if it doesn't appear, wait a bit and refresh the page)\n
                        React with ✅ **only when you sent the funds and have your transaction ID**, if you want to cancel the deposit, react with ❌`)
    msg.edit(embed);
    validReactions.forEach(async (r) => await msg.react(r));

    const collected2 = await msg.awaitReactions(filter, { time: 360000, max: 1 });

    if (!collected2.first() || collected2.first().emoji.name === "❌") {
        embed.setDescription("Deposit request cancelled");
        embed.setColor(color.red);
        msg.reactions.removeAll();
        return msg.edit(embed);
    }

    embed.setDescription("Please send your transaction ID\n*Please double check that the transaction ID you're about to send is valid*");
    msg.edit(embed);
    msg.reactions.removeAll();

    const filterMessage = m => m.author.id === message.author.id;
    const msgCollected = await message.channel.awaitMessages(filterMessage, { time: 30000, max: 1 });

    if (!msgCollected.first()) {
        embed.setDescription("Deposit request cancelled: you didn't sent the transaction ID. If you already sent the funds, please contact an administrator to get refunded");
        embed.setColor(color.red);
        msg.reactions.removeAll();
        return msg.edit(embed);
    }

    if (!/^[0-9a-z]{40}$/.test(msgCollected.first().content)) {
        embed.setColor(color.red);
        embed.setDescription("`ERROR`: The transaction ID that you sent is invalid\nIf you already sent the funds, please contact an administrator to get refunded");
        return msg.edit(embed);
    }

    const txid = msgCollected.first().content;

    embed.setDescription("Verifying your deposit\nPlease wait ⌛...");
    msg.edit(embed);
    msg.reactions.removeAll();
    
    const transactionsList = await axios.get(transactionsApi);
    if (!transactionsList.data) {
        embed.setColor(color.red);
        embed.setDescription("`ERROR`: Impossible to fetch the transactions list.\nIf you already sent the funds, please contact an administrator to get refunded");
        return msg.edit(embed);
    }

    const tx = transactionsList.data[txid];
    if (!tx) {
        embed.setColor(color.red);
        embed.setDescription("`ERROR`: Impossible to find the transaction!\nIf you already sent the funds, please contact an administrator to get refunded");
        return msg.edit(embed);
    }

    const txDate = moment(`${tx.Date} ${tx.Time}`, "DD/MM/YYYY hh:mm:ss");

    console.log(tx.Sender == username)
    console.log(tx.Recipient == "coinexchange")
    console.log(tx.Amount == ducoAmount)
    console.log(before.diff(txDate, "minutes") < 6)
    console.log(!(alreadyUsedTxid.has(txid)))

    if ((tx.Sender == username) && (tx.Recipient == "coinexchange") && (tx.Amount == ducoAmount) && (before.diff(txDate, "minutes") < 6) && !(alreadyUsedTxid.has(txid))) {
        const query = await Profile.findOne({ userID: message.author.id, guildID: message.guild.id });
        if (!query) {
            const newProfile = new Profile({
                username: message.author.username,
                userID: message.author.id,
                guildID: message.guild.id,
                coins: coinAmount,
                bumps: "0",
                xp: 0,
                level: 1
            })

            newProfile.save().catch(err => message.channel.send(`Oops something went wrong ${err}`));
        } else {
            query.coins += coinAmount;
            query.save().catch(err => message.channel.send(`Oops something went wrong ${err}`));
        }

        alreadyUsedTxid.add(txid);

        embed.setColor(color.green);
        embed.setDescription(`Successfully exchanged **${ducoAmount} DUCO** to **${coinAmount} coins**!`);

        msg.edit(embed);
    } else {
        embed.setColor(color.red);
        embed.setDescription("`ERROR`: Invalid transaction! The date, the amount, the recipient or the sender is invalid!\nIf you already sent the funds, please contact an administrator to get refunded");
        return msg.edit(embed);
    }
}

module.exports.config = {
    name: "deposit",
    aliases: [],
    desc: "Exchange DUCO to bot coins",
    usage: "<duco amount> <duco username>",
    category: "economy"
}