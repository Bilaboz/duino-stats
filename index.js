const Discord = require("discord.js");
const fs = require("fs");
const mongoose = require("mongoose");
const moment = require("moment-timezone");

require('dotenv').config();

const onmsg = require("./utils/onmsg");
const color = require("./utils/color.json");
const config = require("./utils/config.json");

const Snipe = require("./models/snipe.js");
const replies = require("./utils/replies.json");

const prefix = config.prefix;

const client = new Discord.Client();

client.login(process.env.token);

mongoose.connect(process.env.mongoURL, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => console.log("Succesfuly connected to MongoDB"))
.catch(err => console.log(`MongoDB connection error: ${err.message}`));


const guildInvites = new Map();

client.on("ready", () => {
    console.log("Connected");
    client.user.setActivity("with your duinos - !help", { type: "PLAYING" });

    client.guilds.cache.forEach(async (g) => {
        g.fetchInvites().then(invites => {
            guildInvites.set(g.id, invites);
        }).catch(err => console.log(err));

        await g.members.fetch();
    })
    console.log(`Successfully fetched members`);
    console.log(`Successfully fetched invites`);

    if (process.env.NODE_ENV !== "dev") {
        client.commands.get("start").run(client);
        console.log("Started the statistics");
    }
})

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();

fs.readdir("./commands/", (err, files) => {
    if (err) console.log(err);

	const jsfiles = files.filter(f => f.split(".").pop() === "js");
	if (jsfiles.length < 0) {
		return console.log("Can't find commands folder or there aren't any commands!");
	}

	jsfiles.forEach((f, i) => {
		let pull = require(`./commands/${f}`);
        client.commands.set(pull.config.name, pull);

		pull.config.aliases.forEach(alias => {
			client.aliases.set(alias, pull.config.name)
        })
        
        console.log(`#${i +1}: ${f} loaded!`);
    })
})

client.on("message", async (message) => {
    if (!message.guild) return;
    if (message.author.bot) return;

    if (message.mentions.has(client.user)) {
        if (message.mentions.everyone) return;

        const reply = replies[Math.floor(Math.random() * replies.length)];
        message.reply(reply);
    }

    const args = message.content.slice(prefix.length).split(" ");
    const cmd = args[0];

    if (message.content.startsWith(prefix)) {
        const commandfile = client.commands.get(cmd) || client.commands.get(client.aliases.get(cmd));
        if (commandfile) commandfile.run(client,message,args,color);
    } else {
        onmsg.run(client, message, args, color);
    }
})

client.on("messageDelete", async (message) => {
    if (message.author.bot) return;

    const query = await Snipe.findOne({});
    if (!query) {
        const newSnipe = new Snipe({
            date: moment(message.createdTimestamp).tz("Europe/Paris").calendar(),
            content: message.content,
            authorAvatar: message.author.avatarURL(),
            authorUsername: message.author.username,
            channel: message.channel.name,
            isImage: false
        })

        newSnipe.save().catch(err => message.channel.send(err));
    } else {
        query.date = moment(message.createdTimestamp).tz("Europe/Paris").calendar();
        query.authorAvatar = message.author.avatarURL();
        query.authorUsername = message.author.username;
        query.channel = message.channel.name;

        const attachment = message.attachments.first();
        if (attachment) {
            query.isImage = true;
            query.attachment = attachment.proxyURL;
            query.content = attachment.name;
        } else {
            query.isImage = false;
            query.content = message.content;
        }

        query.save().catch(err => message.channel.send(err));
    }
})

client.on("guildMemberAdd", async (member) => {
    if (member.guild.id != "677615191793467402") return;
    const channel = member.guild.channels.cache.find(c => c.id === "677617050503479325");

    const role = member.guild.roles.cache.find(r => r.name === "Member");
    if (!role) return;

    member.roles.add(role);

    try {
        const cachedInvites = guildInvites.get(member.guild.id);
        const newInvites = await member.guild.fetchInvites();

        guildInvites.set(member.guild.id, newInvites);
        const usedInvite = newInvites.find(invite => cachedInvites.get(invite.code).uses < invite.uses)

        channel.send(`<:duco:807188450393980958> Welcome on the server **<@${member.id}>**!\nInvited by **${usedInvite.inviter.tag}**`);
    } catch {
        channel.send(`<:duco:807188450393980958> Welcome on the server **<@${member.id}>**!\nBut I couldn't figure out the inviter ¯\\_(ツ)_/¯`);
    }

})
