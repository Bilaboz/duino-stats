const { MessageEmbed } = require("discord.js");
const { prefix } = require("../utils/config.json")

module.exports.run = async (client, message, args, color) => {

    if (!args[1]) {
        const embed = new MessageEmbed()
            .setTitle("List of available commands")
            .setColor(color.yellow)
            .setThumbnail(client.user.avatarURL())
            .setFooter(client.user.username, client.user.avatarURL())
            .setDescription("`!help <command>` to get full command info")
            .setTimestamp()

        const genCommands = client.commands
            .filter(c => c.config.category === "general")
            .map(c => `\`${prefix}${c.config.name}\``)
            .join("\n")

        const ecoCommands = client.commands
            .filter(c => c.config.category === "economy")
            .map(c => `\`${prefix}${c.config.name}\``)
            .join("\n")

        const admCommands = client.commands
            .filter(c => c.config.category === "admin")
            .map(c => `\`${prefix}${c.config.name}\``)
            .join("\n")

        const modCommands = client.commands
            .filter(c => c.config.category === "moderation")
            .map(c => `\`${prefix}${c.config.name}\``)
            .join("\n")

        embed.addField("General", genCommands, true);
        embed.addField("Economy", ecoCommands, true);
        embed.addField("Admin", admCommands, true);
        embed.addField("Moderation", modCommands, true);

        message.channel.send(embed);
    } else {
        const command = client.commands.get(args[1].toLowerCase());
        if (command) {
            const uppercaseCommand = command.config.name.charAt(0).toUpperCase() + command.config.name.slice(1);

            const hcEmbed = new MessageEmbed()
                .setTitle(`${uppercaseCommand} command help`)
                .setColor(color.yellow)
                .setFooter(client.user.username, client.user.avatarURL())
                .setTimestamp()
                .setDescription(`Command arguments: \`<>\` = required \`()\` = optional\n\n**Description**: ${command.config.desc}\n**Usage**: \`${prefix}${command.config.name} ${command.config.usage}\`\n**Aliases**: \`${command.config.aliases.join(", ")}\``)

            message.channel.send(hcEmbed);
        }
    }
}

module.exports.config = {
    name: "help",
    aliases: ["h"],
    category: "general",
    desc: "Show the available commands",
    usage: "(command)"
}
