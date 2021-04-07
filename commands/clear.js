module.exports.run = async (client, message, args) => {
    if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send(":no_entry: You dont't have the permission to do that !");

    const number = parseInt(args[1]);
    if (!number) return message.channel.send("You need to specify a number of messages to delete!");
    if (number < 0) return message.channel.send("You can't specify a negative number");

    await message.delete();

    message.channel.bulkDelete(number)
        .then(messages => message.channel.send(`I deleted \`${messages.size}\` messages!`))
        .then(msg => msg.delete( { timeout: 3000 } ))
}

module.exports.config = {
    name: "clear",
    aliases: [],
    desc: "Delete the specified number of messages",
    usage: "<number>",
    category: "moderation"
}