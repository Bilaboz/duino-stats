const net = require("net");
const { MessageEmbed } = require("discord.js");
const moment = require("moment");
const axios = require("axios");
const WebSocket = require('ws');

const config = require("../utils/config.json");
let cooldown = new Set();

module.exports.run = async (client, message, args, color) => {

    if (cooldown.has(message.author.id)) {
        return message.channel.send(`**${message.author.username}** you can only execute this command every 10 seconds!`);
    } else {
        cooldown.add(message.author.id);
        setTimeout(() => {
            cooldown.delete(message.author.id)
        }, 10000)
    }

    const displayStatus = (serverStatus, statsStatus, webServicesStatus, difference) => {
        const editedStatusEmbed = new MessageEmbed()
            .setAuthor(message.author.username, message.author.avatarURL())
            .setFooter(client.user.username, client.user.avatarURL())
            .setTimestamp()
        
        let finalstring = ""

        if (serverStatus) {
            finalstring += "**Server status**: <:true:709441577503817799>\n";
            editedStatusEmbed.setColor(color.green);
        } else {
            finalstring += "**Server status**: <:nop:692067038453170283>\n";
            editedStatusEmbed.setColor(color.red);
        }

        if (difference > 60) {
            difference = `${parseInt(difference / 60)} minutes`;
        } else {
            if (difference === 1) {
                difference = `${difference} second`;
            } else {
                difference = `${difference} seconds`;
            }
        }

        if (statsStatus) {
            finalstring += `**Statistics status**: <:true:709441577503817799> (Last update: ${difference} ago)\n`;
        } else if (!statsStatus) {
            finalstring += `**Statistics status**: <:nop:692067038453170283> (Last update: ${difference} ago)\n`;
        } else {
            finalstring += `**Statistics status**: ⚠️ (Last update: ${difference} ago)\n`;
        }
        
        if (webServicesStatus) {
            finalstring += `**Webservices status**:  <:true:709441577503817799>`;
        } else {
            finalstring += `**Webservices status**:  <:nop:692067038453170283>`;
        }

        editedStatusEmbed.setDescription(finalstring);
        m.edit(editedStatusEmbed);
    }

    const statusEmbed = new MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL())
        .setFooter(client.user.username, client.user.avatarURL())
        .setTimestamp()
        .setDescription("**Server status**: ...\n**Statistics status**: ...\n**Webservices status**: ...")

    const m = await message.channel.send(statusEmbed);

    let statsStatus, serverStatus, difference, webServicesStatus;

    // ------------ Statistics Status ------------ //

    const response = await axios.get("https://server.duinocoin.com/api.json");

    if (!response.data) {
        statsStatus = false;
    } else {
        const now = moment();
        try {
            let lastUpdate = response.data["Last update"].slice(0, -6);
            lastUpdate = moment(lastUpdate, "DD/MM/YYYY hh:mm:ss");

            difference = now.diff(lastUpdate, 'seconds');
            
            if (difference < 600) {
                statsStatus = true;
            } else if (difference < 1200) {
                statsStatus = "partial";
            } else {
                statsStatus = false;
            }
        } catch {
            statsStatus = false;
        }
    }

    // ------------ Webservices status ------------ //

    const ws = new WebSocket('wss://server.duinocoin.com:15808', {
        origin: 'https://51.15.127.80'
    });

    ws.on('message', (data) => {
        if (data === config.serverVersion) {
            webServicesStatus = true;
        } else {
            webServicesStatus = false;
        }
    });

    // ------------ Server Status ------------ //

    const socket = new net.Socket();
    socket.setEncoding('utf8');
    socket.setTimeout(5000);
    socket.connect(2811, "server.duinocoin.com");

    socket.on("error", (err) => {
        console.log(err);
        serverStatus = false;
        displayStatus(serverStatus, statsStatus, webServicesStatus, difference);
    });

    socket.on("timeout", () => {
        serverStatus = false;
        displayStatus(serverStatus, statsStatus, webServicesStatus, difference);
    })

    socket.once("data", (data) => {
        if (data === config.serverVersion) {
            serverStatus = true;
            socket.end();
        } else {
            serverStatus = false;
            socket.end();
        }
    })

    socket.on("end", () => {
        displayStatus(serverStatus, statsStatus, webServicesStatus, difference);
    })
}

module.exports.config = {
    name: "serverstatus",
    aliases: ["status", "server"],
    category: "general",
    desc: "Display the status of the server",
    usage: ""
}
