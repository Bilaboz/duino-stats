const { Schema, model } = require("mongoose");

const countSchema = new Schema({
    record: Number,
    count: Number,
    guildId: String
});

module.exports = model("Count", countSchema);