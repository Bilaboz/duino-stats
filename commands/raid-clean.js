module.exports.run = async (client, message, args) => {
    if (!message.member.hasPermission("KICK_MEMBERS")) return message.channel.send(":no_entry: You don't have permission to do that!");

    const inviter = args[1];
    if (!inviter) return message.channel.send("Please specify the inviter.");

    const max = parseInt(args[2]);
    if (!max || max < 1 || max > 100) return message.channel.send("Please specify a valid number between 1 and 100 for the max number of messages to fetch.");

    const messages = await message.channel.messages.fetch({ limit: max });

    const toBan = messages.filter(msg => msg.content.includes(inviter) && msg.mentions.members.first())
                          .map(msg => msg.mentions.members.first());

    if (toBan.length === 0) return message.channel.send("No users were found.");

    const promptMsg = await message.channel.send(`You are about to kick ${toBan.length} members from ${toBan[0].user.username} to ${toBan[toBan.length - 1].user.username}. Continue?`);
    const validReactions = ["✅", "❌"];

    for (const reaction of validReactions) {
        await promptMsg.react(reaction);
    }

    const filter = (reaction, user) => validReactions.includes(reaction.emoji.name) && user.id === message.author.id;

    promptMsg.awaitReactions(filter, { time: 30000, max: 1 })
        .then(async collected => {
            if (collected.size === 0) {
                promptMsg.edit("Expired.");
                return message.delete();
            }

            const reaction = collected.first();
            if (reaction.emoji.name === "✅") {
                for (const member of toBan) {
                    await member.kick("raid clean");
                }
                promptMsg.edit(`Successfully kicked ${toBan.length} users.`);
            } else if (reaction.emoji.name === "❌") {
                promptMsg.edit("Canceled.");
            }
        });
};

module.exports.config = {
    name: "raid-clean",
    aliases: [],
    usage: "<inviter#0000> <max number of messages to fetch>",
    category: "admin",
    desc: "Kick the last users that joined from the specified inviter."
};