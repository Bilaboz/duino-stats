const { Schema, model } = require("mongoose");

const snipeSchema = new Schema({
    date: { type: String, required: true },
    content: { type: String, required: true },
    authorAvatar: { type: String, required: true },
    authorUsername: { type: String, required: true },
    channel: { type: String, required: true },
    isImage: { type: Boolean, required: true },
    attachment: { type: String, default: null }
});

module.exports = model("Snipe", snipeSchema);