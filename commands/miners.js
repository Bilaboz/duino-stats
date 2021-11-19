const { MessageEmbed } = require("discord.js");
const axios = require("axios");

module.exports.run = async (client, message, args, color) => {
    message.channel.send({
            files: [
            "https://server.duinocoin.com/minerchart.png"
        ]}
    );
}

module.exports.config = {
    name: "miners",
    aliases: [],
    category: "general",
    desc: "Shows most popular mining softwares",
    usage: ""
}
