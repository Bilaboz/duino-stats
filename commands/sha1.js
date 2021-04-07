const crypto = require("crypto");

module.exports.run = async (client, message, args) => {
    const content = args.slice(1).join(" ");
    if (!content) return message.channel.send(`Empty string given!`);
   
    const sha1 = crypto.createHash("sha1").update(content, "binary").digest("hex");
    message.channel.send(`SHA1 of \`${content}\` is \`${sha1}\``);
}

module.exports.config = {
    name: "sha1",
    aliases: [],
    category: "notlisted",
    desc: "Return sha1 of the message",
    usage: "<text>"
}
