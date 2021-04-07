module.exports.run = async (client, message, args, color) => {

    if (message.author.id !== "170877787421278208") return message.channel.send("You don't have the permission to do this!");

    const tCommand = args[1].toLowerCase();
    if (!tCommand) return message.channel.send("Please specify a command name");

    try {
        delete require.cache[require.resolve(`./${tCommand}.js`)];
        client.commands.delete(tCommand);

        const pull = require(`./${tCommand}.js`);
        client.commands.set(tCommand, pull);

        pull.config.aliases.forEach(alias => {
			client.aliases.set(alias, pull.config.name)
        })

        message.channel.send(`Successfuly reloaded ${tCommand}.js`);
    } catch (err) {
        message.channel.send(`I can't reload ${tCommand}.js! ${err}`);
    }
}

module.exports.config = {
    name: "reload",
    aliases: [],
    category: "notlisted",
    desc: "Reload the specified command",
    usage: "<command>"
}