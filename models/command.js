const mongoose = require("mongoose");

const commandSchema = new mongoose.Schema({
  unitId: { type: String, required: true },
  command: { type: String, required: true },
  commandPayload: { type: Object, default: {} },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Command", commandSchema);
