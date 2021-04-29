const axios = require("axios");
const { MessageEmbed } = require("discord.js");

module.exports.run = async (client, message, args, color) => {

    const username = args[1];
    if (!username) return message.channel.send("Please provide a username first. You can register here http://www.node-s.co.za/duco_exchange/home");

    try { // very hacky but this command isn't really important
        const response = await axios.get(`http://www.node-s.co.za/api/v1/duco/user/balance?username=${username}`);
        const balance = response.data.balance

        if (!balance) return message.channel.send("The user doesn't exist");

        const embed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL())
            .setDescription(`<:duco:807188450393980958> **${username}**'s [Node-S exchange](http://www.node-s.co.za/duco_exchange/home) balance: **${parseFloat(balance).toFixed(4)}**`)
            .setFooter(client.user.username, client.user.avatarURL())
            .setTimestamp()
            .setColor(color.pastelgreen)

        message.channel.send(embed);
    } catch (err) { // very hacky but this command isn't really important
        return message.channel.send(`Something went wrong...\n${err}`);
    }


}

module.exports.config = {
    name: "exchange-balance",
    aliases: ["ebal"],
    usage: "<username>",
    category: "general",
    desc: "Get user balance on the node-s exchange"
}
