const translate = require("@vitalets/google-translate-api");
const { MessageEmbed } = require("discord.js");

module.exports.run = async (client, message, args, color) => {
    if (!args[1]) return message.channel.send("Please specify a message id");

    const content = await message.channel.messages.fetch(args[1]);
    if (!content) return message.channel.send("Couldn't find the message! (it needs to be in the same channel)");

    const language = args[2] || "en";

    const translated = await translate(content.content, { to: language });

    const rEmbed = new MessageEmbed()
        .setColor(color.cyan)
        .setTitle(`Translated from ${translated.from.language.iso} to ${language}`)
        .setDescription(translated.text)
        .setFooter(`Original message: ${content.content}`);

    message.channel.send(rEmbed);
}

module.exports.config = {
    name: "translate",
    aliases: ["tl"],
    category: "general",
    desc: "Translate a message, if no destination language is provided, english will be set as default. Destination languages must be in the following format: pl, en, fr ...",
    usage: "<messageID> (destinationLanguage)"
}