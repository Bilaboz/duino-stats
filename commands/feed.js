let cooldown = new Set();

module.exports.run = async (client, message, args) => {
    
    if (cooldown.has(message.author.id)) {
        message.channel.send(`**${message.author.username}** you can only execute this command every 30 seconds!`);
        return;
    } else {
        cooldown.add(message.author.id)
        setTimeout(() => {
            cooldown.delete(message.author.id)
        }, 30000)
    }

    async function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, ms)
        })
    }

    const idle = "<:eatingidle:724286785752137829>";
    const eating = "<:eatinggboyyyy:724286785571520513>";
    const finished = "<:finished:724286786133819482>";
    const middle = "<:middlekebab:724286785823309914>";
    const startKeb = "<:firstkebabb:724286785785430046>";
    const endKeb = "<:endkebab:724286785772978256>";
    const blank = "<:blank:724288403096600646>";

    // lol

    const msg = await message.channel.send(`${idle}${blank}${startKeb}${middle}${endKeb}`);
    await sleep(500);
    await msg.edit(`${eating}${blank}${startKeb}${middle}${endKeb}`);
    await sleep(500);
    await msg.edit(`${idle}${blank}${startKeb}${middle}${endKeb}`);
    await sleep(750);
    await msg.edit(`${eating}${startKeb}${middle}${endKeb}`);
    await sleep(750);
    await msg.edit(`${idle}${startKeb}${middle}${endKeb}`);
    await sleep(500);
    await msg.edit(`${eating}${middle}${endKeb}`);
    await sleep(500);
    await msg.edit(`${idle}${middle}${endKeb}`);
    await sleep(500);
    await msg.edit(`${eating}${endKeb}`);
    await sleep(500);
    await msg.edit(`${idle}${endKeb}`);
    await sleep(500);
    await msg.edit(`${eating}`);
    await sleep(500);
    await msg.edit(`${finished}`);
}

module.exports.config = {
    name: "feed",
    aliases: ["eat"],
    usage: "",
    category: "general",
    desc: "Eat thiccc boyyy"
}