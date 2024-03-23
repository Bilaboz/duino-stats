const Profile = require("../models/profile.js");
const { botsChannelID } = require("../utils/config.json");

module.exports.run = async (client, message, args) => {
    if (args[0] !== "bump") return;

    const filter = m => m.embeds[0] && m.embeds[0].description && m.embeds[0].description.includes("done");
    const collector = message.channel.createMessageCollector({ filter, time: 15000, max: 1 });

    collector.on('collect', async (collected) => {
        const query = await Profile.findOne({ userID: message.author.id, guildID: message.guild.id });

        if (!query) {
            const newBump = new Profile({
                username: message.author.username,
                userID: message.author.id,
                guildID: message.guild.id,
                coins: 0,
                bumps: 1,
                xp: 0,
                level: 1
            });

            newBump.save().catch(err => console.log(err));
            return message.channel.send(`Bump added! **${message.author.username}** now has 1 bump!`);
        }

        query.bumps += 1;
        query.save().catch(err => console.log(err));
        message.channel.send(`Bump added! **${message.author.username}** now has ${query.bumps} bumps!`);

        setTimeout(() => {
            client.channels.cache.get(botsChannelID).send('Bump ready! <:ok:677964667154333697>');
        }, 7200000);
    });

    collector.on('end', (collected, reason) => {
        if (reason === 'time') {
            return message.channel.send('Bump timed out. Please try again later.');
        }
    });
};

module.exports.config = {
    name: "bump",
    aliases: [],
    category: "notlisted",
    desc: "Bump your profile",
    usage: ""
};