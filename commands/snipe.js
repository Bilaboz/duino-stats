const { MessageEmbed } = require("discord.js");
const Snipe = require("../models/snipe.js");

module.exports.run = async (client, message) => {
    const query = await Snipe.findOne({})
    if (!query) return message.channel.send("Nothing to show");

    const snipeEmbed = new MessageEmbed()
        .setAuthor(`${query.authorUsername} deleted this`, query.authorAvatar)
        .setDescription(query.content)
        .addField("Channel", query.channel, true)
        .addField("Date", query.date, true)
        .setFooter("The date is UTC+2")
        .setColor("#39e0fa")
    
    if (query.isImage) {
        snipeEmbed.setImage(query.attachment);
    }

    message.channel.send(snipeEmbed);
}

module.exports.config = {
    name: "snipe",
    aliases: [],
    usage: "",
    category: "general",
    desc: "Show the last deleted message"
}