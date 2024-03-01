module.exports.run = async (client, message, args) => {
    if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply(":no_entry: You don't have permission to do that!");

    const content = args.slice(1).join(" ");
    if (!content) return message.channel.send("Please provide something to say!");

    try {
        await message.delete();
        await message.channel.send(content);
        message.channel.send("Message sent!");
    } catch (error) {
        console.error("Error sending message:", error);
        message.channel.send("Oops! Something went wrong while trying to send the message.");
    }
}

module.exports.config = {
    name: "say",
    aliases: [],
    category: "admin",
    desc: "Make the bot say something",
    usage: "<content>"
}