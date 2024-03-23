const { MessageEmbed } = require("discord.js");
const { prefix } = require("../utils/config.json");

module.exports.run = async (client, message, args, color) => {

    if (!args[1]) {
        const embed = new MessageEmbed()
            .setTitle("List of available commands")
            .setColor(color.yellow)
            .setThumbnail(client.user.avatarURL())
            .setFooter(client.user.username, client.user.avatarURL())
            .setDescription("`!help <command>` to get full command info")
            .setTimestamp();

        const categories = {
            "general": "General",
            "economy": "Economy",
            "admin": "Admin",
            "moderation": "Moderation"
        };

        for (const categoryKey in categories) {
            const categoryCommands = client.commands
                .filter(c => c.config.category === categoryKey)
                .map(c => `\`${prefix}${c.config.name}\``)
                .join("\n");
                
            if (categoryCommands) {
                embed.addField(categories[categoryKey], categoryCommands, true);
            }
        }

        message.channel.send(embed);
    } else {
        const commandName = args[1].toLowerCase();
        const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.config.aliases && cmd.config.aliases.includes(commandName));

        if (command) {
            const uppercaseCommand = command.config.name.charAt(0).toUpperCase() + command.config.name.slice(1);

            const hcEmbed = new MessageEmbed()
                .setTitle(`${uppercaseCommand} command help`)
                .setColor(color.yellow)
                .setFooter(client.user.username, client.user.avatarURL())
                .setTimestamp()
                .setDescription(`Command arguments: \`<>\` = required \`()\` = optional\n\n**Description**: ${command.config.desc}\n**Usage**: \`${prefix}${command.config.name} ${command.config.usage}\`\n**Aliases**: ${command.config.aliases.length ? command.config.aliases.join(", ") : "None"}`);

            message.channel.send(hcEmbed);
        } else {
            message.channel.send("That command doesn't exist!");
        }
    }
};

module.exports.config = {
    name: "help",
    aliases: ["h"],
    category: "general",
    desc: "Show the available commands",
    usage: "(command)"
};