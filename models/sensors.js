const mongoose = require("mongoose");

const SensorDataSchema = new mongoose.Schema({
  sensorId: {
    type: String,
    required: true,
  },
  sensorName: {
    type: String,
    required: true,
  },
  value: {
    type: Number,
  },
  location: {
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const SensorData = mongoose.model("SensorData", SensorDataSchema);

module.exports = SensorData;
