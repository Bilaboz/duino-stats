const mongoose = require("mongoose");

const statSchema = mongoose.Schema({
    guildID: String,
    coins: Number,
    bets: Number,
    wins: Number,
    losses: Number
})

module.exports = mongoose.model("Stat", statSchema);