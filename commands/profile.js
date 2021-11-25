const {
    MessageEmbed
} = require("discord.js");
const Profile = require("../models/profile.js")
    const dayjs = require("dayjs");
const localizedFormat = require('dayjs/plugin/localizedFormat');

const {
    getMember
} = require("../utils/functions.js");

dayjs.extend(localizedFormat);

module.exports.run = async(client, message, args, color) => {
    let tUser = getMember(message, args[1]);
    if (tUser === -1)
        return;
    tUser = tUser.user;

    if (tUser.id == client.user.id)
        return;

    const getProfileEmbed = async(message, user) => {
        const query = await Profile.findOne({
                userID: user.id,
                guildID: message.guild.id
            })

            if (!query) {
                const newProfile = new Profile({
                        username: user.username,
                        userID: user.id,
                        guildID: message.guild.id,
                        coins: 0,
                        bumps: "0",
                        xp: 0,
                        level: 1,
                        pColor: color.yellow
                    })

                    newProfile.save().catch(err => message.channel.send(`Oops something went wrong ${err}`))
                    return message.channel.send("**Please re-execute the command** <:true:704740848314613960>");
            }

            const tUserGuilded = message.guild.members.cache.get(user.id);
        const xpNeeded = parseInt(80 * Math.pow(query.level, 2));

        if (!query.streak)
            query.streak = 0;

        let finalstring = `**Level**: ${query.level}
                           **Bot coins**: ${query.coins} (${query.coins/100} DUCO)
                           **XP**: ${query.xp} ( ${query.xp}/${xpNeeded} )\n
                           **Bumps**: ${query.bumps}
                           **Daily streak**: ${query.streak}\n
                           **Join date**: ${dayjs(tUserGuilded.joinedAt).format("LLL")}
                           **Account creation date**: ${dayjs(user.createdAt).format("LLL")}`;

        if (query.pDesc)
            finalstring += `\n\n**Bio**: ${query.pDesc}`;
        if (!query.pColor)
            query.pColor = color.yellow;

        const pEmbed = new MessageEmbed()
            .setTitle(`${user.username}'s profile`)
            .setThumbnail(tUser.avatarURL())
            .setDescription(finalstring)
            .setColor(query.pColor)
            .setFooter("The reactions expire after 120 seconds")

            query.save().catch(err => message.channel.send(`Oops something went wrong ${err} at getprofile func boi`))
            return pEmbed;
    }

    const updateProfile = async(message, user, dColor, desc) => {
        const query = await Profile.findOne({
                userID: user.id,
                guildID: message.guild.id
            })

            if (dColor) {
                let color;
                switch (dColor) {
                case "red":
                    color = "FF0000"
                        break;
                case "cyan":
                    color = "#3498DB"
                        break;
                case "green":
                    color = "00FF00"
                        break;
                case "purple":
                    color = "9B59B6"
                        break;
                case "blue":
                    color = "0000FF"
                        break;
                case "yellow":
                    color = "FFFF00"
                        break;
                case "black":
                    color = "000000"
                        break;
                case "white":
                    color = "FFFFFF"
                        break;
                case "orange":
                    color = "FF8000"
                        break;
                case "rose":
                    color = "FF00FF"
                        break;
                }

                query.pColor = color;
            }

            if (desc !== 0)
                query.pDesc = desc;

            query.save().catch(err => message.channel.send(`Oops something went wrong ${err}`));
    }

    const pSettingsEmbed = new MessageEmbed()
        .setTitle(`${tUser.username} profile`)
        .setThumbnail(tUser.avatarURL())
        .setDescription(`**${tUser.username}** profile settings\n\n⬅️ to return to the main page\n🌈 to edit your profile color\n📝 to edit your profile description`)
        .setColor(color.yellow)
        .setFooter("The reactions expire after 120 seconds")

        const pDescEmbed = new MessageEmbed()
        .setTitle(`${tUser.username} profile`)
        .setDescription(`Please send the new description\n*Canceled after 20 seconds*`)
        .setFooter("The reactions expire after 120 seconds")
        .setColor(color.yellow)

        const pColorEmbed = new MessageEmbed()
        .setTitle(`${tUser.username} profile`)
        .setThumbnail(tUser.avatarURL())
        .setDescription(`Please send the desired color\n**Red**\n**Cyan**\n**Green**\n**Purple**\n**Blue**\n**Yellow**\n**Black**\n**White**\n**Orange**\n**Rose**\n*Canceled after 30 seconds*`)
        .setFooter("The reactions expire after 120 seconds")
        .setColor(color.yellow)

        const pEmbed = await getProfileEmbed(message, tUser);

    const msg = await message.channel.send(pEmbed);
    msg.react("⚙");

    const filter = (reaction, user) => user.id === tUser.id;

    const collector = msg.createReactionCollector(filter, {
            time: 120000
        });
    collector.on("collect", async r => {

        if (r.emoji.name === "⚙") {
            msg.reactions.removeAll();
            msg.edit(pSettingsEmbed);

            await msg.react("⬅️");
            await msg.react("🌈");
            await msg.react("📝");

        } else if (r.emoji.name === "⬅️") {
            msg.reactions.removeAll();

            const pEmbed = await getProfileEmbed(message, tUser);

            msg.edit(pEmbed);
            msg.react("⚙");

        } else if (r.emoji.name === "📝") {
            msg.reactions.removeAll();
            msg.react("⬅️");
            msg.edit(pDescEmbed);

            const descFilter = m => m.author.id == tUser.id;

            const descCollector = message.channel.createMessageCollector(descFilter, {
                    max: 1,
                    time: 20000
                });
            descCollector.on("collect", async collected => {
                const desc = collected.content;
                if (desc.length > 150)
                    return message.channel.send("The description you sent is too long");

                await updateProfile(message, tUser, 0, desc);
                message.channel.send(`**${tUser.username}** Successfuly updated profile description to ${desc}!`);
            })

            descCollector.on("end", () => {
                message.channel.send("Description update ended!");
            })

        } else if (r.emoji.name === "🌈") {
            msg.reactions.removeAll();
            msg.react("⬅️");
            msg.edit(pColorEmbed);

            const validColors = ["red", "cyan", "green", "purple", "blue", "yellow", "black", "white", "orange", "rose"];
            const colorFilter = m => validColors.includes(m.content.toLowerCase()) && m.author.id === tUser.id;

            const colorCollector = message.channel.createMessageCollector(colorFilter, {
                    max: 1,
                    time: 30000
                });
            colorCollector.on("collect", async collected => {
                await updateProfile(message, tUser, collected.content.toLowerCase(), 0);
                message.channel.send(`**${tUser.username}** Successfuly updated profile color to ${collected.content}!`);
            })
            colorCollector.on("end", () => {
                message.channel.send("Profile color update ended!");
            })
        }
    })

    collector.on("end", async() => {
        msg.reactions.removeAll();
        const pEmbed = await getProfileEmbed(message, tUser);
        msg.edit(pEmbed);
    })
}

module.exports.config = {
    name: "profile",
    aliases: ["p"],
    category: "economy",
    desc: "Show your profile / someone profile",
    usage: "(user)"
}
