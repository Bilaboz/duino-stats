module.exports.run = async (client, message, args) => {
    if (!message.member.permissions.has("MANAGE_MESSAGES")) return message.channel.send(":no_entry: You don't have the permission to do that!");

    const number = parseInt(args[0]);
    if (!number || isNaN(number) || number <= 0) return message.channel.send("Please specify a valid number of messages to delete!");

    await message.delete();

    message.channel.bulkDelete(number)
        .then(messages => message.channel.send(`Deleted \`${messages.size}\` messages!`).then(msg => msg.delete({ timeout: 3000 })))
        .catch(error => message.channel.send(`Error deleting messages: ${error}`));
};

module.exports.config = {
    name: "clear",
    aliases: [],
    desc: "Delete the specified number of messages",
    usage: "<number>",
    category: "moderation"
};