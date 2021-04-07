module.exports.run = async (client, message, args) => {
    if (!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply(":no_entry: You dont't have the permission to do that !");

    const content = args.slice(1).join(" ");
    message.delete().catch();
    message.channel.send(content);
}

module.exports.config = {
    name: "say",
    aliases: [],
    category: "admin",
    desc: "Make the boy say something",
    usage: "<tosay>"
}
