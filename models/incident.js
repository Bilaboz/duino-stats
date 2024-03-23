const { Schema, model } = require("mongoose");

const incidentSchema = new Schema({
    username: String,
    userID: String,
    reason: [String],
    type: [String],
    moderator: [String],
    time: [Date],
    count: Number
});

module.exports = model("Incident", incidentSchema);