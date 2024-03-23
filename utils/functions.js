const { MessageEmbed } = require("discord.js");

module.exports = {
    getMember: (message, toFind = '') => {
        toFind = toFind.toLowerCase();

        let target = message.guild.members.cache.get(toFind) || message.mentions.members.first();

        if (!target && toFind) {
            target = message.guild.members.cache.find(member => 
                member.displayName.toLowerCase().includes(toFind) || 
                member.user.tag.toLowerCase().includes(toFind)
            );

            if (!target) {
                return message.member;
            } else if (target) {
                const multipleEmbed = new MessageEmbed()
                    .setAuthor(message.author.username, message.author.displayAvatarURL())
                    .setDescription(`Multiple users found! Please use \`id\` / \`mention\`\n\n${target.user.username}#${target.user.discriminator} - \`${target.id}\``)
                    .setColor("#00aede")
                    .setFooter("Duino Stats", "https://cdn.discordapp.com/avatars/691404890290913280/82a989583ce771a37676b58f07731c85.webp")
                    .setTimestamp();
                
                message.channel.send({ embeds: [multipleEmbed] });
                return null;
            }
        }
            
        return target || message.member;
    }
}