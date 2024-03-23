const { MessageEmbed } = require("discord.js");
const dayjs = require("dayjs");

const Profile = require("../models/profile");
const Incident = require("../models/incident");
const Count = require("../models/count");
const config = require("../utils/config.json");

let cooldown = new Set();
dayjs.extend(require('dayjs/plugin/utc'));
dayjs.extend(require('dayjs/plugin/timezone'));

module.exports.run = async (client, message, args, color) => {

    //---------------------------Invite detection------------------------------//

    const date = dayjs().tz("Europe/Paris").format('LLL');
    if ((message.content.toLowerCase().includes("discord.gg") ||
        message.content.toLowerCase().includes("discordapp.com/invite") ||
        message.content.toLowerCase().includes("t.me") ||
        message.content.toLowerCase().includes("telegram.me")) &&
        !message.member.permissions.has("ADMINISTRATOR")) {
        const newIncident = new Incident({
            username: message.author.username,
            userID: message.author.id,
            reason: ["Posted an invite"],
            type: "Warn",
            moderator: "Duino Stats",
            time: date,
            count: 1
        });

        await newIncident.save().catch(err => message.channel.send(err));

        const dmEmbed = new MessageEmbed()
            .setTitle("You have been warned")
            .addField("Reason", "Posted an invite")
            .addField("Moderator", "Duino Stats")
            .addField("Date", date)
            .setColor("#ff5c5c")
            .setFooter("The date is UTC+2")
            .setTimestamp();

        const warnEmbed = new MessageEmbed()
            .setTitle("New warn")
            .setDescription(`**${message.author.username}** has been warned!`)
            .addField("Reason", "Posted an invite")
            .addField("Moderator", "Duino Stats")
            .addField("Date", date)
            .setColor("#ff5c5c")
            .setFooter("The date is UTC+2")
            .setTimestamp();

        message.author.send({ embeds: [dmEmbed] }).catch(console.error);
        message.channel.send({ embeds: [warnEmbed] });
        client.channels.cache.get(config.logChannelID).send({ embeds: [warnEmbed] });
        return message.delete();
    }

    //---------------------------Suggestions channel------------------------------//

    if (message.channel.id === config.suggestionChannelID) {
        await message.react(config.trueEmojiID);
        await message.react(config.falseEmojiID);
    }

    //---------------------------Counting------------------------------//

    if (message.channel.id === config.countingChannelID) {

        const lastMessage = (await message.channel.messages.fetch({ limit: 2 })).last();

        const query = await Count.findOne({ guildId: message.guild.id });
        if (!query) {
            const newCount = new Count({ count: 1, record: 0, guildId: message.guild.id });
            await newCount.save().catch(err => message.channel.send(err));
            await message.channel.send("Server channel finished initializing, please start again").then(m => m.delete({ timeout: 4000 }));
            return setTimeout(() => message.delete().catch(), 5000);
        }

        if (lastMessage.author.id === message.author.id) {
            query.record = Math.max(query.record, query.count);
            query.count = 1;
            await query.save().catch(err => message.channel.send(err));
            await message.channel.send(`<@${message.author.id}> you can't count twice in a row!`).then(m => m.delete({ timeout: 4000 }));
            return setTimeout(() => message.delete().catch(), 5000);
        }

        if (!/^[0-9]*$/.test(message.content)) {
            query.record = Math.max(query.record, query.count);
            query.count = 1;
            await query.save().catch(err => message.channel.send(err));
            await message.channel.send(`<@${message.author.id}> please send only numbers!`).then(m => m.delete({ timeout: 4000 }));
            return setTimeout(() => message.delete().catch(), 5000);
        }

        if (parseInt(message.content) - parseInt(lastMessage.content) !== 1) {
            query.record = Math.max(query.record, query.count);
            query.count = 1;
            await query.save().catch(err => message.channel.send(err));
            await message.channel.send(`<@${message.author.id}> doesn't know how to count <:bruh:716749844504510526>`).then(m => m.delete({ timeout: 4000 }));
            return setTimeout(() => message.delete().catch(), 5000);
        }

        query.count += 1;
        return await query.save().catch(err => message.channel.send(err));
    }

    //---------------------------XP & Coins------------------------------//

    if (message.content.length < 10 || cooldown.has(message.author.id)) return;

    cooldown.add(message.author.id);
    setTimeout(() => cooldown.delete(message.author.id), 10000);

    const cAmount = Math.floor(Math.random() * 3) + 5;
    const cChance = Math.floor(Math.random() * 15);
    const xpChance = Math.floor(Math.random() * 3);
    const xpAmount = Math.floor(Math.random() * 15) + 9;

    //---------------------------Coins------------------------------//

    if (cChance === 0) {

        const wEmbed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.displayAvatarURL())
            .setDescription(`**${message.author.username}**, you earned ${cAmount} bot coins!`)
            .setColor(color.cyan)
            .setTimestamp();

        const query = await Profile.findOneAndUpdate(
            { userID: message.author.id, guildID: message.guild.id },
            { $inc: { coins: cAmount } },
            { upsert: true, new: true }
        ).catch(console.error);

        await message.channel.send({ embeds: [wEmbed] }).then(m => m.delete({ timeout: 4000 }));

        if (query) {
            return query;
        }
    }

    //---------------------------XP & levels------------------------------//

    if (xpChance === 0) {
        const query = await Profile.findOneAndUpdate(
            { userID: message.author.id, guildID: message.guild.id },
            { $inc: { xp: xpAmount } },
            { upsert: true, new: true }
        ).catch(console.error);

        if (!query) {
            const newXp = new Profile({
                username: message.author.username,
                userID: message.author.id,
                guildID: message.guild.id,
                coins: 0,
                bumps: "0",
                xp: xpAmount,
                level: 1
            });

            await newXp.save().catch(err => message.channel.send(`Oops something went wrong ${err} at onmsg lmao`));
        } else {
            const nextLevel = parseInt(80 * Math.pow(query.level, 2));

            if (query.xp >= nextLevel) {
                const won = xpAmount + 4 * query.level + 20;

                query.level += 1;
                query.coins += won;

                const lvlUpEmbed = new MessageEmbed()
                    .setAuthor(message.author.username, message.author.displayAvatarURL())
                    .setDescription(`**${message.author.username}**, you leveled up!\nYou won **${won} coins** and you are now level ${query.level}!`)
                    .setColor(color.green)
                    .setTimestamp();

                await message.channel.send({ embeds: [lvlUpEmbed] });
            }

            await query.save().catch(err => message.channel.send(`Oops something went wrong ${err} at onmsg lmao`));

            if (query.level >= 5 && !message.member.roles.cache.has(config.activeMemberRoleID)) {
                const role = message.guild.roles.cache.get(config.activeMemberRoleID);
                await message.member.roles.add(role).catch(console.error);
            }
        }
    }
};