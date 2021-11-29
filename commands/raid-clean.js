module.exports.run = async (client, message, args) => {

    if (!message.member.hasPermission("KICK_MEMBERS")) return message.channel.send(":no_entry: You dont't have the permission to do that !");

    const inviter = args[1];
    if (!inviter)
        return message.channel.send("Please specify the inviter");

    const max = parseInt(args[2]);
    if (!max)
        return message.channel.send("Please specify the max number of messages to fetch");

    const messages = await message.channel.messages.fetch({ limit: max });

    let toBan = [];
    messages.forEach(msg => {
        if (msg.content.includes(inviter) && msg.mentions.members.first()) {
            toBan.push(msg.mentions.members.first());
        }
    })
    
    const promptMsg = await message.channel.send(`You are about to kick ${toBan.length} members, continue?`);
    const validReactions = ["✅", "❌"];
    const filter = (reaction, user) => validReactions.includes(reaction.emoji.name) && user.id === message.author.id;

    validReactions.forEach(async (r) => await promptMsg.react(r));

    promptMsg.awaitReactions(filter, { time: 30000, max: 1 }).then(async collected => {
        if (!collected.first()) {
            promptMsg.edit("expired");
            return message.delete();
        }
        if (collected.first().emoji.name === "✅") {
            toBan.forEach(member => {
                member.kick("raid clean");
            })
            promptMsg.edit(`Successfully kicked ${toBan.length} users`);
        } else if (collected.first().emoji.name === "❌") {
            promptMsg.edit("canceled");
        }
    });
}

module.exports.config = {
    name: "raid-clean",
    aliases: [],
    usage: "<inviter#0000> <max number of messages to fetch>",
    category: "admin",
    desc: "Kick the last users that joined from the specified inviter"
}