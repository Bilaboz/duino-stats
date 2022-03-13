const { MessageEmbed } = require("discord.js");
const { ducoEmojiID } = require("../utils/config.json");

module.exports.run = async (client, message, args, color) => {
    const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL())
        .setDescription(`<:duco:${ducoEmojiID}> Duino-Coin Webwallet is currently available at this address: **https://wallet.duinocoin.com**`)
        .setFooter(client.user.username, client.user.avatarURL())
        .setTimestamp()
        .setColor(color.yellow)

    message.channel.send(embed);
}

module.exports.config = {
    name: "webwallet",
    aliases: [],
    category: "general",
    desc: "Send the webwallet link",
    usage: ""
}
