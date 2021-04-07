const mongoose = require("mongoose");

const countSchema = mongoose.Schema({
    record: Number,
    count: Number,
    guildId: String
})

module.exports = mongoose.model("Count", countSchema);