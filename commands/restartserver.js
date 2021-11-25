const { exec } = require("child_process");

module.exports.run = async (client, message) => {
    if (!message.member.hasPermission("KICK_MEMBERS")) return message.channel.send(":no_entry: You dont't have the permission to do that !");

    exec("echo 1 > /home/debian/duino-coin-master-server/config/restart_signal", (err, stdout, stderr) => {
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
    name: "restart-server",
    aliases: ["server-restart"],
    usage: "",
    category: "moderation",
    desc: "Restart the server"
}
