const { MessageEmbed } = require("discord.js");

module.exports = {
    getMember: (message, toFind = '') => {
        toFind = toFind.toLowerCase();

        let target = message.guild.members.cache.get(toFind);
        if (!target && message.mentions.members) target = message.mentions.members.first();

        if (!target && toFind) {
            target = message.guild.members.cache.filter(member => {
                return member.displayName.toLowerCase().includes(toFind) || member.user.tag.toLowerCase().includes(toFind);
            });

            if (!target.size) {
                target = message.member;
            } else if (target.size === 1) {
                target = target.first();
            } else {
                let finalStr = "Multiple users found! Please use `id` / `mention`\n\n"
                target.forEach(u => {
                    finalStr += `\`${u.user.username}#${u.user.discriminator}\` - \`${u.user.id}\`\n`;
                })

                if (finalStr.length > 2048) {
                    message.channel.send("Too many users found!");
                    return -1;
                }
        
                const multipleEmbed = new MessageEmbed()
                    .setAuthor(message.author.username, message.author.avatarURL())
                    .setDescription(finalStr)
                    .setColor("#00aede")
                    .setFooter("Duino Stats", "https://cdn.discordapp.com/avatars/691404890290913280/82a989583ce771a37676b58f07731c85.webp") // doing this manually to avoid passing client as a third argument
                    .setTimestamp()
                    
                message.channel.send(multipleEmbed);
                return -1
            }
        }
            
        if (!target) target = message.member;
        return target;
    }
}