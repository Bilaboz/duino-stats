const { MessageEmbed } = require("discord.js");
const { ducoEmojiID } = require("../utils/config.json");

module.exports.run = async (client, message, args, color) => {
    try {
        const embed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL())
            .setDescription(`<:duco:${ducoEmojiID}> Duino-Coin Webwallet is currently available at this address: **[https://wallet.duinocoin.com](https://wallet.duinocoin.com)**`)
            .setFooter(client.user.username, client.user.avatarURL())
            .setTimestamp()
            .setColor(color.yellow);

        message.channel.send(embed);
    } catch (error) {
        console.error("Error sending webwallet link:", error);
        message.channel.send("Sorry, I couldn't send the webwallet link at the moment. Please try again later.");
    }
};

module.exports.config = {
    name: "webwallet",
    aliases: [],
    category: "general",
    desc: "Send the webwallet link",
    usage: ""
};