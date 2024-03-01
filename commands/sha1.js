const crypto = require("crypto");

module.exports.run = async (client, message, args) => {
    const content = args.slice(1).join(" ");
    
    // Check if input content is missing or empty
    if (!content) {
        return message.channel.send(`Please provide text to hash!`);
    }
   
    try {
        // Compute SHA-1 hash
        const sha1 = crypto.createHash("sha1").update(content, "binary").digest("hex");
        
        // Send formatted output message
        message.channel.send(`SHA1 of \`${content}\` is \`${sha1}\``);
    } catch (error) {
        // Handle any errors during hash computation
        console.error("Error computing SHA1 hash:", error);
        message.channel.send("An error occurred while computing the SHA1 hash. Please try again later.");
    }
}

module.exports.config = {
    name: "sha1",
    aliases: [],
    category: "utility",
    desc: "Return SHA1 hash of the provided text",
    usage: "<text>"
}