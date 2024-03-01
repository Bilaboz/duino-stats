const translate = require("@vitalets/google-translate-api");
const { MessageEmbed } = require("discord.js");

module.exports.run = async (client, message, args, color) => {
    try {
        if (!args[1]) return message.channel.send("Please specify a message ID");

        const messageID = args[1];
        const content = await message.channel.messages.fetch(messageID);
        if (!content) return message.channel.send("Couldn't find the message! (it needs to be in the same channel)");

        const language = args[2] || "en";

        const translated = await translate(content.content, { to: language });

        const translationEmbed = new MessageEmbed()
            .setColor(color.cyan)
            .setTitle(`Translation from ${translated.from.language.iso.toUpperCase()} to ${language.toUpperCase()}`)
            .setDescription(translated.text)
            .addField("Original Message", content.content)
            .setTimestamp();

        message.channel.send(translationEmbed);
    } catch (error) {
        console.error("Error in translate command:", error);
        message.channel.send("An error occurred while translating the message.");
    }
}

module.exports.config = {
    name: "translate",
    aliases: ["tl"],
    category: "general",
    desc: "Translate a message into a specified language.",
    usage: "<messageID> [destinationLanguage]"
};