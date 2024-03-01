module.exports.run = async (client, message, args, color) => {
    // Check if the user is authorized to use this command
    if (message.author.id !== "170877787421278208") return message.channel.send("You don't have permission to do this!");

    // Extract the command name from the arguments
    const tCommand = args[1]?.toLowerCase();
    if (!tCommand) return message.channel.send("Please specify a command name.");

    try {
        // Delete the cached module from require cache
        delete require.cache[require.resolve(`./${tCommand}.js`)];

        // Remove the command and its aliases from the collections
        const command = client.commands.get(tCommand);
        if (!command) return message.channel.send(`The command \`${tCommand}\` does not exist.`);
        client.commands.delete(tCommand);
        command.config.aliases.forEach(alias => client.aliases.delete(alias));

        // Reload the command and add it back to the collections
        const pull = require(`./${tCommand}.js`);
        client.commands.set(tCommand, pull);
        pull.config.aliases.forEach(alias => client.aliases.set(alias, pull.config.name));

        message.channel.send(`Successfully reloaded \`${tCommand}.js\`.`);
    } catch (err) {
        message.channel.send(`An error occurred while trying to reload \`${tCommand}.js\`: ${err}`);
    }
};

module.exports.config = {
    name: "reload",
    aliases: [],
    category: "admin",
    desc: "Reload the specified command.",
    usage: "<command>"
};