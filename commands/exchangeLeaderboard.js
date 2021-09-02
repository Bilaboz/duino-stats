const axios = require("axios");
const { MessageEmbed } = require("discord.js");

module.exports.run = async (client, message, args, color) => {

    try { // very hacky but this command isn't really important
        let response = await axios.get(`http://www.node-s.co.za/api/v1/duco/leaderboard?qty=10`);
        response = response.data.record;

        let finalstring = "";
        for (let i = 0; i < 10; i++) {
            if (i >= response.length) break // in case if there is less than 5 entries

            if (i === 0) {
                finalstring += `🏆 - **${response[i].username}** with **${parseFloat(response[i].balance).toFixed(4)}** <:duco:807188450393980958>\n\n`;
            } else if (i === 1) {
                finalstring += `🥈 - **${response[i].username}** with **${parseFloat(response[i].balance).toFixed(4)}** <:duco:807188450393980958>\n\n`;
            } else if (i === 2) {
                finalstring += `🥉 - **${response[i].username}** with **${parseFloat(response[i].balance).toFixed(4)}** <:duco:807188450393980958>\n\n`;
            } else {
                finalstring += `#${i+1} - **${response[i].username}** with **${parseFloat(response[i].balance).toFixed(4)}** <:duco:807188450393980958>\n\n`;
            }
        }

        const lEmbed = new MessageEmbed()
            .setColor(color.green)
            .setTitle("Leaderboard of node-s exchange balances")
            .setDescription(finalstring)
            .setURL('http://www.node-s.co.za/duco_exchange/home')
            .setTimestamp()
    
        message.channel.send(lEmbed);
    } catch(err) { // very hacky but this command isn't really important
        return message.channel.send(`Something went wrong...\n${err}`);
    }


}

module.exports.config = {
    name: "exchange-leaderboard",
    aliases: ["eleader", "eleaderboard"],
    usage: "<username>",
    category: "general",
    desc: "Display the leaderboard of the node-s exchange"
}
