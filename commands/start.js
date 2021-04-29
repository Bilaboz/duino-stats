const { MessageEmbed } = require("discord.js");
const color = require("../utils/color.json");
const axios = require("axios");

const api = "https://server.duinocoin.com/api.json"
const nodeapi = "http://www.node-s.co.za/api/v1/duco/exchange_rate";

module.exports.run = async (client, message) => {
    if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send(":no_entry: You don't have the permission to do that !");

    const m = await message.channel.send("Starting stats...");

    const channel = client.channels.cache.get('691936892458893342');
    await channel.messages.fetch({ limit: 3}).then(msgs => msgs.forEach(msg => msg.delete()));

    const tempEmbed = new MessageEmbed().setDescription("Updating...");
    const msg = await channel.send(tempEmbed);

    async function update() {
        let stats;
        try {
            const response = await axios.get(api);
            stats = response.data;
        } catch (err) {
            console.log(err);
            tempEmbed.setDescription(`\`ERROR\`: Error while fetching the API\n\`${response.status} ${response.statusText}\``);
            return msg.edit(tempEmbed);
        }
        
        let nodesPrice
        try {
            const noderesponse = await axios.get(nodeapi);
            nodesPrice = noderesponse.data.value;
        } catch (err) {
            nodesPrice = "error";
        }

        let workersCount;
        try {
            workersCount = Object.keys(stats["Active workers"]).length;
        } catch (err) {
            console.log(`Statistics update error: ${err}`);
            workersCount = "error";
        }
        

        const embed = new MessageEmbed()
        .setColor(color.yellow)
        .setTitle("Duino-Coin Statistics")
        .setURL("https://revoxhere.github.io/duco-statistics/statistics")
        .addField(":pick: Pool Hashrate", `${stats["Pool hashrate"]}`, true)
        .addField(":gear: Current Difficulty", stats["Current difficulty"], true)
        .addField(":bricks: Mined Blocks", stats["Mined blocks"], true)
        .addField(":clock9: Last Update", `${stats["Last update"]}`, true)
        .addField(":family_man_woman_boy:  Registered Users", stats["Registered users"], true)
        .addField(`<:Amusing:685522949905580055> Active Workers`, workersCount, true)
        .addField(`<:purple_duco_logo:832307025463607347> Estimated DUCO price`, `${stats["Duco price"]}$`, true)
        .addField(`:calendar: All time mined DUCO`, `${stats["All-time mined DUCO"]} ᕲ`, true)
        .addField(`:hash: Last block hash`, stats["Last block hash"], true)
        .addField(":link: Active connections", stats["Active connections"], true)
        .addField(":desktop: Server CPU usage", stats["Server CPU usage"] + "%", true)
        .addField(":currency_exchange: Node-S Exchange price", nodesPrice + "$", true)
        .setThumbnail("https://raw.githubusercontent.com/revoxhere/duino-coin/master/Resources/duco.png")
        .setFooter("The statistics are updated every 60 seconds", client.user.avatarURL(),)
        .setTimestamp()

        msg.edit(embed)
    }

    update();
    timer = setInterval(update, 60*1000);

    m.edit("Stats started!");
}

module.exports.config = {
    name: "start",
    aliases: [],
    category: "admin",
    desc: "Start the stats",
    usage: ""
}
