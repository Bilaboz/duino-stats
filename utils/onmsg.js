const { MessageEmbed } = require("discord.js");
const moment = require("moment");

const Profile = require("../models/profile");
const Incident = require("../models/incident");
const Count = require("../models/count");

let cooldown = new Set();

module.exports.run = async (client, message, args, color) => {

    //---------------------------Invite detection------------------------------//

    const date = moment().tz("Europe/Paris").format('LLL');
    if (message.content.toLowerCase().includes("discord.gg" || "discordapp.com/invite") && !message.member.hasPermission("ADMINISTRATOR")) {
        Incident.findOne({
            userID: message.author.id
        }, (err, query) => {
            if (err) console.log(err);

            if (!query) {
                const newIncident = new Incident({
                    username: message.author.username,
                    userID: message.author.id,
                    reason: "Posted an invite",
                    type: "Warn",
                    moderator: "Duino",
                    time: date,
                    count: 1
                });
    
                newIncident.save().catch(err => message.channel.send(err));
            } else {
                query.reason.push("Posted an invite");
                query.moderator.push("Duino");
                query.time.push(date);
                query.type.push("Warn");
                query.count += 1;
    
                query.save().catch(err => message.channel.send(err));
            }
        })
        
        const dmEmbed = new MessageEmbed()
            .setTitle("You have been warned")
            .addField("Reason", "Posted an invite")
            .addField("Moderator", "Duino")
            .addField("Date", date)
            .setColor("#ff5c5c")
            .setFooter("The date is UTC+2")
            .setTimestamp()

        const warnEmbed = new MessageEmbed()
            .setTitle("New warn")
            .setDescription(`**${message.author.username}** have been warned!`)
            .addField("Reason", "Posted an invite")
            .addField("Moderator", "Duino")
            .addField("Date", date)
            .setColor("#ff5c5c")
            .setFooter("The date is UTC+2")
            .setTimestamp()

        message.author.send(dmEmbed);
        message.channel.send(warnEmbed);
        client.channels.cache.get("699320187664728177").send(warnEmbed); // #commands channel
        return message.delete();
    }

    //---------------------------Suggestions channel------------------------------//

    if (message.channel.id == "677616731468070921") {
        await message.react("704740848314613960");
        return await message.react("692069337854378026");
    }

    //---------------------------Counting------------------------------//

    if (message.channel.id == "789855163393376276") {

        let lm = await message.channel.messages.fetch({ limit: 2 });
        lm = lm.last()

        const query = await Count.findOne({ guildId: message.guild.id });
        if (!query) {
            const newCount = new Count({ count: 1, record: 0, guildId: message.guild.id });
            newCount.save().catch(err => message.channel.send(err));
            return message.channel.send("Server channel finished initalizing, please start again");
        }

        if (lm.author.id == message.author.id) {
            if (query.count > query.record) query.record = query.count;
            query.count = 1;
            await query.save().catch(err => message.channel.send(err));
            message.channel.send(`<@${message.author.id}> you can't count twice in a row!\nCurrent record: ${query.record}\nStarting again`);
            return await message.channel.send("1");
        }

        if (!/^[0-9]*$/.test(message.content)) {
            if (query.count > query.record) query.record = query.count;
            query.count = 1;
            await query.save().catch(err => message.channel.send(err));
            message.channel.send(`<@${message.author.id}> please send only numbers!\nCurrent record: ${query.record}\nStarting again`);
            return await message.channel.send("1");
        }
        
        if (!(parseInt(message.content) - parseInt(lm.content) === 1)) {
            if (query.count > query.record) query.record = query.count;
            query.count = 1;
            await query.save().catch(err => message.channel.send(err));
            message.channel.send(`<@${message.author.id}> doesn't know how to count <:bruh:716749844504510526>\nCurrent record: ${query.record}\nStarting again`);
            return await message.channel.send("1");
        } else {
            query.count += 1
            return await query.save().catch(err => message.channel.send(err));
        }
    }


    //---------------------------XP & Coins------------------------------//

    if (message.content.length < 10) return;

    if (cooldown.has(message.author.id)) {
        return;
    } else {
        cooldown.add(message.author.id);
    }

    setTimeout(() => {
        cooldown.delete(message.author.id);
    }, 10000)
    
    const cAmount = Math.floor(Math.random() * 10) + 5;
    const cChance = Math.floor(Math.random() * 12);
    const xpChance = Math.floor(Math.random() * 3);
    const xpAmount = Math.floor(Math.random() * 15) + 9;


    //---------------------------Coins------------------------------//

    if (cChance === 0) {

        const wEmbed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL())
            .setDescription(`**${message.author.username}**, you earned ${cAmount} bot coins!`)
            .setColor(color.cyan)
            .setTimestamp()

        Profile.findOne({
            userID: message.author.id,
            guildID: message.guild.id
        }, (err, query) => {
            if (err) console.log(err);

            if (!query) {
                const newBank = new Profile({
                    username: message.author.username,
                    userID: message.author.id,
                    guildID: message.guild.id,
                    coins: cAmount,
                    bumps: "0",
                    xp: 0,
                    level: 1
                })

                newBank.save().catch(err => message.channel.send(`Oops something went wrong ${err} at onmsg lmao`));
                message.channel.send(wEmbed).then(m => m.delete({ timeout: 4000 }));
            } else {
                query.coins += cAmount;
                query.save().catch(err => message.channel.send(`Oops something went wrong ${err}`));
                message.channel.send(wEmbed).then(m => m.delete({ timeout: 4000 }));
            }
        })
        
    }

    //---------------------------XP & levels------------------------------//

    if (xpChance === 0) {
        Profile.findOne({
            userID: message.author.id,
            guildID: message.guild.id
        }, (err,query) => {
            if (err) console.log(err);

            if (!query) {
                const newXp = new Profile({
                    username: message.author.username,
                    userID: message.author.id,
                    guildID: message.guild.id,
                    coins: 0,
                    bumps: "0",
                    xp: xpAmount,
                    level: 1
                })

                newXp.save().catch(err => message.channel.send(`Oops something went wrong ${err} at onmsg lmao`))
            } else {
                query.xp += xpAmount;
                const nextLevel = parseInt(80 * Math.pow(query.level, 2));

                if (query.xp >= nextLevel) {
                    const won = xpAmount + 4 * query.level + 20;

                    query.level += 1;
                    query.coins += won;

                    const lvlUpEmbed = new MessageEmbed()
                        .setAuthor(message.author.username, message.author.avatarURL())
                        .setDescription(`**${message.author.username}**, you leveled up!\nYou won **${won} coins** and you are now level ${query.level}!`)
                        .setColor(color.green)
                        .setTimestamp()

                    message.channel.send(lvlUpEmbed)
                }

                query.save().catch(err => message.channel.send(`Oops something went wrong ${err} at onmsg lmao`));
            }
        })
    }
}
