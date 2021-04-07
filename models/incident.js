const mongoose = require("mongoose");

const incidentSchema = mongoose.Schema({
    username: String,
    userID: String,
    reason: Array,
    type: Array,
    moderator: Array,
    time: Array,
    count: Number
});

module.exports = mongoose.model("Incident", incidentSchema);