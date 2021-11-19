const Profile = require("../models/profile.js");

module.exports.run = async (client, message, args) => {
    if (args[1] !== "bump") return;

    const filter = m => m.embeds[0] && m.embeds[0].description && m.embeds[0].description.includes("done");
    const result = await message.channel.awaitMessages(filter, { max: 1, time: 15000, errors: ["time"] }).catch(() => {});

    if (!result) return;

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
        client.channels.cache.get("678301439835111455").send('Bump ready! <:ok:677964667154333697>');
    }, 7200000)
}

module.exports.config = {
    name: "d",
    aliases: [],
    category: "notlisted",
    desc: "huhu lol",
    usage: ""
}