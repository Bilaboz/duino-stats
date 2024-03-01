const { Schema, model } = require("mongoose");

const profileSchema = new Schema({
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
});

module.exports = model("Profile", profileSchema);