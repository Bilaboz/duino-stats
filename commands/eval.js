module.exports.run = async (client, message, args) => {
    const validIds = ["170877787421278208", "599482890321133580"];

    if (!validIds.includes(message.author.id)) return message.channel.send("no");

    const rArgs = args.slice(1)

    const clean = (text) => {
        if (typeof(text) === "string") {
            return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
        } else {
            return text;
        }
    }

    try {
        const code = rArgs.join(" ");
        if (code.includes("process.env.token")) return message.channel.send("TOK3N");
        if (code.includes("process.env.mongoURL")) return message.channel.send("no");
        
        let evaled = eval(code);

        if (typeof evaled !== "string")
        evaled = require("util").inspect(evaled);

        message.channel.send(clean(evaled), {code:"js"});
    } catch (err) {
        message.channel.send(`\`ERROR\` \`\`\`JS\n${clean(err)}\n\`\`\``);
    }

}

module.exports.config = {
    name: "eval",
    aliases: [],
    category: "notlisted",
    desc: "eval command lol",
    usage: "<js code>"
}