const { MessageEmbed } = require("discord.js");
const dayjs = require("dayjs");
const localizedFormat = require('dayjs/plugin/localizedFormat');

const Profile = require("../models/profile.js");
const { getMember } = require("../utils/functions.js");
const { trueEmojiID } = require("../utils/config.json");

dayjs.extend(localizedFormat);

module.exports.run = async (client, message, args, color) => {
    let tUser = getMember(message, args[1]);
    if (tUser === -1 || tUser.id === client.user.id) return;

    const getProfileEmbed = async (user) => {
        const query = await Profile.findOne({ userID: user.id, guildID: message.guild.id });

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
            });

            await newProfile.save().catch(err => message.channel.send(`Oops something went wrong ${err}`));
            return message.channel.send(`**Please re-execute the command** <:true:${trueEmojiID}>`);
        }

        const xpNeeded = parseInt(80 * Math.pow(query.level, 2));
        const tUserGuilded = message.guild.members.cache.get(user.id);
        const description = query.pDesc ? `\n\n**Bio**: ${query.pDesc}` : '';

        return new MessageEmbed()
            .setTitle(`${user.username}'s profile`)
            .setThumbnail(user.avatarURL())
            .setDescription(`**Level**: ${query.level}\n**Bot coins**: ${query.coins} (${query.coins / 100} DUCO)\n**XP**: ${query.xp} (${query.xp}/${xpNeeded})\n**Bumps**: ${query.bumps}\n**Daily streak**: ${query.streak}\n**Join date**: ${dayjs(tUserGuilded.joinedAt).format("LLL")}\n**Account creation date**: ${dayjs(user.createdAt).format("LLL")}${description}`)
            .setColor(query.pColor || color.yellow)
            .setFooter("The reactions expire after 120 seconds");
    };

    const updateProfile = async (user, dColor, desc) => {
        const query = await Profile.findOne({ userID: user.id, guildID: message.guild.id });

        if (dColor) {
            const colors = {
                red: "FF0000",
                cyan: "#3498DB",
                green: "00FF00",
                purple: "9B59B6",
                blue: "0000FF",
                yellow: "FFFF00",
                black: "000000",
                white: "FFFFFF",
                orange: "FF8000",
                rose: "FF00FF"
            };
            query.pColor = colors[dColor] || color.yellow;
        }

        if (desc) query.pDesc = desc;
        await query.save().catch(err => message.channel.send(`Oops something went wrong ${err}`));
    };

    const pSettingsEmbed = new MessageEmbed()
        .setTitle(`${tUser.username} profile`)
        .setThumbnail(tUser.avatarURL())
        .setDescription(`**${tUser.username}** profile settings\n\n⬅️ to return to the main page\n🌈 to edit your profile color\n📝 to edit your profile description`)
        .setColor(color.yellow)
        .setFooter("The reactions expire after 120 seconds");

    const pDescEmbed = new MessageEmbed()
        .setTitle(`${tUser.username} profile`)
        .setDescription(`Please send the new description\n*Canceled after 20 seconds*`)
        .setFooter("The reactions expire after 120 seconds")
        .setColor(color.yellow);

    const pColorEmbed = new MessageEmbed()
        .setTitle(`${tUser.username} profile`)
        .setThumbnail(tUser.avatarURL())
        .setDescription(`Please send the desired color\n**Red**\n**Cyan**\n**Green**\n**Purple**\n**Blue**\n**Yellow**\n**Black**\n**White**\n**Orange**\n**Rose**\n*Canceled after 30 seconds*`)
        .setFooter("The reactions expire after 120 seconds")
        .setColor(color.yellow);

    const pEmbed = await getProfileEmbed(tUser);
    const msg = await message.channel.send(pEmbed);
    await msg.react("⚙");

    const filter = (reaction, user) => user.id === tUser.id;
    const collector = msg.createReactionCollector(filter, { time: 120000 });

    collector.on("collect", async (r) => {
        if (r.emoji.name === "⚙") {
            await msg.reactions.removeAll();
            await msg.edit(pSettingsEmbed);
            await msg.react("⬅️");
            await msg.react("🌈");
            await msg.react("📝");
        } else if (r.emoji.name === "⬅️") {
            await msg.reactions.removeAll();
            const pEmbed = await getProfileEmbed(tUser);
            await msg.edit(pEmbed);
            await msg.react("⚙");
        } else if (r.emoji.name === "📝") {
            await msg.reactions.removeAll();
            await msg.react("⬅️");
            await msg.edit(pDescEmbed);

            const descFilter = m => m.author.id === tUser.id;
            const descCollector = message.channel.createMessageCollector(descFilter, { max: 1, time: 20000 });

            descCollector.on("collect", async (collected) => {
                const desc = collected.content;
                if (desc.length > 150) return message.channel.send("The description you sent is too long");
                await updateProfile(tUser, 0, desc);
                message.channel.send(`**${tUser.username}** Successfuly updated profile description to ${desc}!`);
            });

            descCollector.on("end", () => {
                message.channel.send("Description update ended!");
            });
        } else if (r.emoji.name === "🌈") {
            await msg.reactions.removeAll();
            await msg.react("⬅️");
            await msg.edit(pColorEmbed);

            const validColors = ["red", "cyan", "green", "purple", "blue", "yellow", "black", "white", "orange", "rose"];
            const colorFilter = m => validColors.includes(m.content.toLowerCase()) && m.author.id === tUser.id;

            const colorCollector = message.channel.createMessageCollector(colorFilter, { max: 1, time: 30000 });
            colorCollector.on("collect", async (collected) => {
                await updateProfile(tUser, collected.content.toLowerCase(), 0);
                message.channel.send(`**${tUser.username}** Successfuly updated profile color to ${collected.content}!`);
            });
            colorCollector.on("end", () => {
                message.channel.send("Profile color update ended!");
            });
        }
    });

    collector.on("end", async () => {
        await msg.reactions.removeAll();
        const pEmbed = await getProfileEmbed(tUser);
        await msg.edit(pEmbed);
    });
};

module.exports.config = {
    name: "profile",
    aliases: ["p"],
    category: "economy",
    desc: "Show your profile / someone profile",
    usage: "(user)"
};