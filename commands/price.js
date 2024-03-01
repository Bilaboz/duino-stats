const { MessageEmbed } = require("discord.js");
const axios = require("axios");

const { ducoEmojiID } = require("../utils/config.json");

const api = "https://server.duinocoin.com/api.json";

module.exports.run = async (client, message, args, color) => {
    try {
        const response = await axios.get(api);
        const {
            "Duco price": price,
            "Duco price BCH": price_bch,
            "Duco price TRX": price_trx,
            "Duco JustSwap price": justswapprice,
            "Duco Node-S price": nodeprice,
        } = response.data;

        const embed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL())
            .addFields(
                { name: `<:duco:${ducoEmojiID}> DUCO Exchange (XMG)`, value: `$${price}`, inline: true },
                { name: `<:duco:${ducoEmojiID}> DUCO Exchange (BCH)`, value: `$${price_bch}`, inline: true },
                { name: `<:duco:${ducoEmojiID}> DUCO Exchange (TRX)`, value: `$${price_trx}`, inline: true },
                { name: ":currency_exchange: Node-S Exchange", value: `$${nodeprice}`, inline: true },
                { name: ":white_flower: JustSwap", value: `$${justswapprice}`, inline: true },
                { name: ":person_standing: otc-trading", value: "check <#692840562067243008>", inline: true }
            )
            .setDescription("Please keep in mind that the price on the chart is updated every day.")
            .attachFiles("https://server.duinocoin.com/prices.png")
            .setImage('attachment://prices.png')
            .setFooter(client.user.username, client.user.avatarURL())
            .setTimestamp()
            .setColor(color.yellow);

        message.channel.send(embed);
    } catch (err) {
        console.log(err);
        message.channel.send("Can't fetch the data, the API is probably down <:why:677964669532504094>");
    }
};

module.exports.config = {
    name: "price",
    aliases: [],
    category: "general",
    desc: "Show the current estimated DUCO price",
    usage: "",
};