const mongoose = require("mongoose");

const profileSchema = mongoose.Schema({
    username: String,
    userID: String,
    guildID: String,
    coins: Number,
    bumps: Number,
    xp: Number,
    level: Number,
    pColor: String,
    pDesc: String,
    lastClaim: Number,
    streak: Number
})

module.exports = mongoose.model("Profile", profileSchema);