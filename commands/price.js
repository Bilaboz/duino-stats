const { MessageEmbed } = require("discord.js");
const api = "https://server.duinocoin.com/api.json";
const nodeapi = "http://www.node-s.co.za/api/v1/duco/exchange_rate";
const axios = require("axios");

module.exports.run = async (client, message, args, color) => {

    let response, noderesponse;
    try {
        response = await axios.get(api);
        //noderesponse = await axios.get(nodeapi);
    } catch (err) {
        console.log(err);
        return message.channel.send("Can't fetch the data, the API is probably down <:why:677964669532504094>");
    }

    const price = response.data["Duco price"];
    const justswapprice = response.data["Duco JustSwap price"];
    const nodeprice = "error" //noderesponse.data["value"];

    const embed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL())
        .addField("<:duco:807188450393980958> DUCO Exchange", `$${price}`, true)
        .addField(":currency_exchange: Node-S Exchange", `$${nodeprice}`, true)
        .addField(":white_flower: JustSwap", `$${justswapprice}`, true)
        .addField(":person_standing: otc-trading", `check <#692840562067243008>`, true)
        .setDescription(`Please keep in mind that price on the chart is updated every 1 day.`)
        .attachFiles("https://server.duinocoin.com/prices.png")
        .setImage('attachment://prices.png')
        .setFooter(client.user.username, client.user.avatarURL())
        .setTimestamp()
        .setColor(color.yellow)

    message.channel.send(embed);
}

module.exports.config = {
    name: "price",
    aliases: [],
    category: "general",
    desc: "Show current estimated DUCO price",
    usage: ""
}
