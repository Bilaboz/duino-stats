const { MessageEmbed } = require("discord.js");
const axios = require("axios");

const balancesApi = "http://127.0.0.1/balances/";
const priceApi = "http://127.0.0.1/api.json";

module.exports.run = async (client, message, args, color) => {
    const username = args[1]
    if (!username) return message.channel.send("Provide a username first");

    let balance, response;
    try {
        response = await axios.get(balancesApi + username);
        if (!response.data.success) return message.channel.send("This user doesn't exist");
        else balance = parseFloat(response.data.result.balance);
    } catch (err) {
        console.log(err);
        return message.channel.send("`ERROR` Can't fetch the balances: " + err);
    }
    
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
        .setTitle(`${username}'s Duino-Coin account`)
        .setAuthor(message.author.username, message.author.avatarURL())
        .addFields(
            { name: '<:duco_logo:832307063395975218> Balance', value: `${balance} DUCO ($${balanceInUSD.toFixed(4)})`},
            { name: ':question: Verified account', value: `${response.data.result.verified}`, inline: true},
            { name: ':calendar: Created', value: `${response.data.result.created}`, inline: true}
        )
        .setDescription(`Tip: try **+bal ${username}** to view more stats using **Duino Stats Mini**`)
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
