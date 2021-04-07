const { MessageEmbed } = require("discord.js");
const Profile = require("../models/profile.js");

module.exports.run = async (client, message, args, color) => {

    const bet = parseInt(args[1]);
    if (!bet) return message.channel.send("Please specify a number of coins to bet!");
    if (bet < 0) return message.channel.send("You can't specify a negative number");

    const validColors = ["red", "black", "green"];
    const tColor = args[2];
    if (!tColor || !validColors.includes(tColor)) {
        return message.channel.send("Please specify a color to bet on: `red`, `black`or `green`");
    }

    const noCoinsEmbed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL())
        .setColor(color.red)
        .setDescription(`**${message.author.username}**, you don't have enough coins to do this!`)
        .setFooter(client.user.username, client.user.avatarURL())
        .setTimestamp()

    const query = await Profile.findOne({ userID: message.author.id, guildID: message.guild.id });
    if (!query || query.coins < bet) {
        return message.channel.send(noCoinsEmbed);
    }

    const firstEmbed = new MessageEmbed()
        .setColor(color.green)
        .setAuthor(message.author.username, message.author.avatarURL())
        .setDescription("**Rolling ...**\n\n1️⃣2️⃣3️⃣")
        .setFooter("Red: x2, Black: x2, Green: x14", client.user.avatarURL())

    const secondEmbed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL())
        .setDescription("**Rolling ...**\n\n4️⃣5️⃣6️⃣")
        .setFooter("Red: x2, Black: x2, Green: x14", client.user.avatarURL())

    const thirdEmbed = new MessageEmbed()
        .setColor(color.red)
        .setAuthor(message.author.username, message.author.avatarURL())
        .setDescription("**Rolling ...**\n\n7️⃣8️⃣9️⃣")
        .setFooter("Red: x2, Black: x2, Green: x14", client.user.avatarURL())

    const msg = await message.channel.send(firstEmbed);
    await msg.edit(secondEmbed);
    await msg.edit(thirdEmbed);

    const numbers = ["0", "1r", "2r", "3r", "4r", "5r", "6r", "7r", "8b", "9b", "10b", "11b", "12b", "13b", "14b"];
    const result = numbers[Math.floor(Math.random() * numbers.length)];

    let resultColor, hexColor;
    if (result.endsWith("r")) {
        resultColor = "red";
        hexColor = "FF0000";
    } else if (result.endsWith("b")) {
        resultColor = "black";
        hexColor = "000000";
    } else {
        resultColor = "green";
        hexColor = "#2ECC71";
    }
    
    const wonEmbed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL())
        .setColor(hexColor)
        .attachFiles([`./utils/roulette/${result}.png`])
        .setThumbnail(`attachment://${result}.png`)
        .setFooter("Red: x2, Black: x2, Green: x14", client.user.avatarURL())

    const lostEmbed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL())
        .setColor(hexColor)
        .attachFiles([`./utils/roulette/${result}.png`])
        .setThumbnail(`attachment://${result}.png`)
        .setDescription(`The color was **${resultColor}** !\nYou **lost** **${bet} coins**!\nAnd you have now **${query.coins - bet} coins!**`)
        .setFooter("Red: x2, Black: x2, Green: x14", client.user.avatarURL())

    if (resultColor === "green" && resultColor === tColor.toLowerCase()) {
        query.coins += bet * 14;

        wonEmbed.setDescription(`The color was **${resultColor}** !\nYou **won** **${bet*14} coins**!\nAnd you have now **${query.coins} coins!**`);
        msg.edit(wonEmbed);
    } else if (resultColor === tColor.toLowerCase()) {
        query.coins += bet;

        wonEmbed.setDescription(`The color was **${resultColor}** !\nYou **won** **${bet} coins**!\nAnd you have now **${query.coins} coins!**`);
        msg.edit(wonEmbed);
    } else {
        query.coins -= bet;
        msg.edit(lostEmbed)
    }

    query.save().catch(err => `Something went wrong ${err}`);
}

module.exports.config = {
    name: "roulette",
    aliases: ["r"],
    desc: "Play roulette",
    usage: "<coins>",
    category: "economy"
}