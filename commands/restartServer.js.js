const { exec } = require("child_process");

module.exports.run = async (client, message, arg) => {
    if (!message.member.hasPermission("KICK_MEMBERS")) return message.channel.send(":no_entry: You dont't have the permission to do that !");

    exec("sudo systemctl restart masterserver", (err, stdout, stderr) => {
        if (err) {
            message.channel.send(`An error has occured:\n${err}`);
        } else {
            message.channel.send("Successfully restarted the server <:true:709441577503817799>");
            console.log(`stdout: ${stdout}\n`);
            console.log(`stderr: ${stderr}\n`);
        }
    })

}

module.exports.config = {
    name: "restart-serve",
    aliases: ["server-restart"],
    usage: "",
    category: "moderation",
    desc: "Restart the server"
}