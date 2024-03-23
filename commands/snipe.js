const { MessageEmbed } = require("discord.js");
const Snipe = require("../models/snipe.js");

module.exports.run = async (client, message) => {
    try {
        const query = await Snipe.findOne({});
        if (!query) {
            return message.channel.send("There are no recently deleted messages to show.");
        }

        const snipeEmbed = new MessageEmbed()
            .setAuthor(`${query.authorUsername} deleted this`, query.authorAvatar)
            .addField("Content", query.content || "*No content*")
            .addField("Channel", query.channel, true)
            .addField("Date", query.date, true)
            .setFooter("Timezone: UTC+2")
            .setColor("#39e0fa");
        
        if (query.isImage) {
            snipeEmbed.setImage(query.attachment);
        }

        message.channel.send(snipeEmbed);
    } catch (error) {
        console.error("Error retrieving deleted message:", error);
        message.channel.send("An error occurred while retrieving the deleted message.");
    }
}

module.exports.config = {
    name: "snipe",
    aliases: ["sniper"],
    usage: "",
    category: "general",
    desc: "Show the last deleted message"
}