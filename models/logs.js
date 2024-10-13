const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  unitId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  mode: String,
  alarmStatus: Boolean,
  temperature: String,
  gps: {
    lat: String,
    lon: String,
  },
  speed: String,
  command: String,
  commandPayload: { type: Object, default: {} },
});

module.exports = mongoose.model("Log", logSchema);
