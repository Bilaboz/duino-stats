const { MessageEmbed } = require("discord.js");
const axios = require("axios");

const balancesApi = "https://server.duinocoin.com/balances.json";
const priceApi = "https://server.duinocoin.com/api.json";

module.exports.run = async (client, message, args, color) => {
    const username = args[1]
    if (!username) return message.channel.send("Provide a username first");

    const response = await axios.get(balancesApi);
    if (!response.data) return message.channel.send("`ERROR` Can't fetch the balances!")
    
    const balance = parseFloat(response.data[username]);
    if (!balance) return message.channel.send("This user doesn't exist or isn't listed in the API");
    
    const responsePrice = await axios.get(priceApi);
    if (!responsePrice.data) return message.channel.send("`ERROR` Can't fetch the price!");

    const price = parseFloat(responsePrice.data["Duco price"]);
    const balanceInUSD = balance * price;

    const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL())
        .setDescription(`**${username}**'s balance: **${balance}** <:duco:807188450393980958> ($${balanceInUSD.toFixed(4)})`)
        .setFooter(client.user.username, client.user.avatarURL())
        .setTimestamp()
        .setColor(color.yellow)
        
    message.channel.send(embed);
}

module.exports.config = {
    name: "balance",
    aliases: ["bal"],
    category: "general",
    desc: "Get user balance",
    usage: "<DUCO username>"
}
