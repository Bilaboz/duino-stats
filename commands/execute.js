const { exec } = require("child_process");

module.exports.run = async (client, message, args) => {
    const validIds = ["170877787421278208", "599482890321133580"];
    if (!validIds.includes(message.author.id))
        return message.channel.send(":no_entry: You dont't have the permission to do that !");

    const command = args.slice(1).join(" ");

    if (command.includes("rm")) return message.channel.send("`rm` command isn't allowed");

    exec(command, (err, stdout, stderr) => {
        if (err) {
            message.channel.send(`Error:\n${err}`);
        } else {
            message.channel.send(`stdout:\n\`\`\`bash\n${stdout}\`\`\`\nstderr:\n\`\`\`${stderr}\`\`\``);
        }
    })

}

module.exports.config = {
    name: "execute",
    aliases: ["exec"],
    category: "moderation",
    desc: "Execute the bash command",
    usage: "<bash command>"
  }