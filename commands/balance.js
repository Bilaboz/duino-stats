const { MessageEmbed } = require("discord.js");
const axios = require("axios");

const balancesApi = "https://server.duinocoin.com:5000/balances/";
const priceApi = "https://server.duinocoin.com/api.json";

module.exports.run = async (client, message, args, color) => {
    const username = args[1]
    if (!username) return message.channel.send("Provide a username first");

    let balance;
    try {
        const response = await axios.get(balancesApi + username);
        console.log(response)
        balance = parseFloat(response.data.result["balance"]);
    } catch (err) {
        if (err.response.status === 400) {
            return message.channel.send("This user doesn't exist");
        }
        
        console.log(err);
        return message.channel.send("`ERROR` Can't fetch the balances: " + err);
    }
    
    if (!balance) return message.channel.send("This user doesn't exist");
    
    let price;
    try {
        const responsePrice = await axios.get(priceApi);
        price = parseFloat(responsePrice.data["Duco price"]);
    } catch (err) {
        console.log(err);
        return message.channel.send("`ERROR` Can't fetch the price!");
    }
    
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
