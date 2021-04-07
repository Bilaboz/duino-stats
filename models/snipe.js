const mongoose = require("mongoose");

const snipeSchema = mongoose.Schema ({
    date: String,
    content: String,
    authorAvatar: String,
    authorUsername: String,
    channel: String,
    isImage: Boolean,
    attachment: String
})

module.exports = mongoose.model("Snipe", snipeSchema);