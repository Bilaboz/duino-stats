const { exec } = require("child_process");

module.exports.run = async (client, message) => {
    // Check if the user has the required permission
    if (!message.member.hasPermission("ADMINISTRATOR")) {
        return message.channel.send(":no_entry: You don't have permission to do that.");
    }

    // Restart the server
    exec("echo 1 > /home/debian/duino-coin-master-server/config/restart_signal", (err, stdout, stderr) => {
        if (err) {
            // Handle error
            console.error(err);
            return message.channel.send(`An error occurred while restarting the server:\n${err.message}`);
        } else {
            // Server restarted successfully
            console.log(`stdout: ${stdout}\n`);
            console.log(`stderr: ${stderr}\n`);
            return message.channel.send("Successfully restarted the server <:true:709441577503817799>");
        }
    });
};

module.exports.config = {
    name: "restart-server",
    aliases: ["server-restart"],
    usage: "",
    category: "moderation",
    desc: "Restart the server."
};