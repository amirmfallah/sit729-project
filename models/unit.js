const mongoose = require("mongoose");

const unitSchema = new mongoose.Schema({
  unitId: { type: String, required: true, unique: true },
  description: { type: String },
  status: { type: String, default: "active" }, // Unit status: active/inactive
});

module.exports = mongoose.model("Unit", unitSchema);
