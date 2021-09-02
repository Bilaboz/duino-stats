const { MessageEmbed } = require("discord.js");
const Profile = require("../models/profile");

module.exports.run = async (client, message, args, color) => {

    const amount = parseInt(args[1]);
    if (!amount) return message.channel.send("Please specify a number of coins to bet!");
    if (amount <= 0) return message.channel.send("You can't specify a negative number");
    if (amount < 20) return message.channel.send("Minimum number of coins to start a coinflip game is **20**");

    let player1 = await Profile.findOne({
        userID: message.author.id,
        guildID: message.guild.id
    })

    if (!player1 || player1.coins < amount) {
        const noCoinsEmbed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL())
            .setColor(color.red)
            .setDescription(`**${message.author.username}**, you don't have enough coins to do this!`)
            .setFooter(client.user.username, client.user.avatarURL())
            .setTimestamp()

        return message.channel.send(noCoinsEmbed);
    }

    let gameEmbed = new MessageEmbed()
        .setAuthor(`${message.author.username}'s coinflip game`, message.author.avatarURL())
        .setColor("#2c9ef5")
        .setFooter(`${client.user.username} - There is no fees when you play against the bot`, client.user.avatarURL())
        .setTimestamp()
        .setDescription(`**${message.author.username}** has started a coinflip game of **${amount} coins**!\n
                        React with :coin: to play against him!\n
                        <@${message.author.id}>, if you don't want to wait you can play against the bot by reacting with :robot:`)


    const gameMessage = await message.channel.send(gameEmbed);
    await gameMessage.react("🪙");
    await gameMessage.react("🤖");

    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const playGame = () => {
        const filter = (reaction, user) => ((reaction.emoji.name == '🪙' && user.id !== message.author.id) || (reaction.emoji.name == '🤖' && user.id === message.author.id));
        gameMessage.awaitReactions(filter, { time: 60000, max: 1 })
        .then(async (collected) => {
            const reaction = collected.first();
            const user2 = reaction.users.cache.last();

            if (reaction.emoji.name === "🪙") {
                let player2 = await Profile.findOne({ userID: user2.id, guildID: message.guild.id });
                if (!player2 || player2.coins < amount) {
                    message.channel.send(`**${user2.username}** you don't have enough coins to enter this game!`);
                    gameMessage.reactions.removeAll();
                    await gameMessage.react("🪙");
                    await gameMessage.react("🤖");

                    return playGame(); // restart the game
                }

                gameEmbed.setDescription(`<@${user2.id}> has joined the game!\nRolling...\n📀`);
                gameMessage.edit(gameEmbed);
                await sleep(1000);

                gameEmbed.setDescription(`<@${user2.id}> has joined the game!\nRolling...\n💿`);
                gameMessage.edit(gameEmbed);
                await sleep(1000);

                gameEmbed.setDescription(`<@${user2.id}> has joined the game!\nRolling...\n📀`);
                gameMessage.edit(gameEmbed);
                await sleep(1500); // suspens ...


                const roll = Math.random() * 100;

                if (roll < 50) {
                    player1.coins += parseInt(amount * 0.95);
                    player2.coins -= amount;

                    player1.save().catch(err => message.channel.send(`Something went wrong ${err}`));
                    player2.save().catch(err => message.channel.send(`Something went wrong ${err}`));

                    gameEmbed.setDescription(`📀 - <@${message.author.id}> won against <@${user2.id}>!
                                            **${message.author.username}, ${parseInt(amount*0.95)} coins** have been added to your account!`)
                    gameEmbed.setFooter(`${client.user.username} - The 5% fees are here to prevent abuse`, client.user.avatarURL())

                    gameMessage.edit(gameEmbed);
                } else {
                    player2.coins += parseInt(amount * 0.95);
                    player1.coins -= amount;

                    player1.save().catch(err => message.channel.send(`Something went wrong ${err}`));
                    player2.save().catch(err => message.channel.send(`Something went wrong ${err}`));

                    gameEmbed.setDescription(`💿 - <@${user2.id}> won against <@${message.author.id}>!
                                            **${user2.username}, ${parseInt(amount*0.95)} coins** have been added to your account!`)
                    gameEmbed.setFooter(`${client.user.username} - The 5% fees are here to prevent abuse`, client.user.avatarURL())

                    gameMessage.edit(gameEmbed);
                }
            } else { // 🤖
                gameEmbed.setDescription(`<@691404890290913280> has joined the game!\nRolling...\n📀`);
                gameMessage.edit(gameEmbed);
                await sleep(1000);

                gameEmbed.setDescription(`<@691404890290913280> has joined the game!\nRolling...\n💿`);
                gameMessage.edit(gameEmbed);
                await sleep(1000);

                gameEmbed.setDescription(`<@691404890290913280> has joined the game!\nRolling...\n📀`);
                gameMessage.edit(gameEmbed);
                await sleep(1500); // suspens ...


                const roll = Math.random() * 100;

                if (roll < 49) {
                    player1.coins += amount;
                    player1.save().catch(err => message.channel.send(`Something went wrong ${err}`));

                    gameEmbed.setDescription(`📀 - <@${message.author.id}> won against <@691404890290913280>!
                                            **${message.author.username}, ${amount} coins** have been added to your account!`)
                    gameEmbed.setFooter(`${client.user.username} - There is no fees when you play against the bot`, client.user.avatarURL())

                    gameMessage.edit(gameEmbed);
                } else {
                    player1.coins -= amount;
                    player1.save().catch(err => message.channel.send(`Something went wrong ${err}`));

                    gameEmbed.setDescription(`💿 - <@691404890290913280> won against <@${message.author.id}>!
                                            **Duino Stats, ${amount} coins** have been added to your account!`)
                    gameEmbed.setFooter(`${client.user.username} - There is no fees when you play against the bot`, client.user.avatarURL())

                    gameMessage.edit(gameEmbed);
                }
            }
        })
        .catch((err) => { // if nobody reacted
            gameEmbed.setDescription(`**${message.author.username}** your coinflip game has expired!`);
            gameMessage.edit(gameEmbed);
            gameMessage.reactions.removeAll();
        })
    }

    playGame();
}

module.exports.config = {
    name: "coinflip",
    aliases: ["cf"],
    desc: "Start a coinflip game against someone or the bot",
    usage: "<coins>",
    category: "economy"
}