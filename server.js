const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const mqtt = require("mqtt");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");

// Models
const Unit = require("./models/unit");
const Log = require("./models/logs");
const Command = require("./models/command");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

// MQTT Client Setup
const mqttClient = mqtt.connect("mqtt://broker.hivemq.com");
mqttClient.on("connect", () => {
  console.log("Connected to MQTT broker");
  mqttClient.subscribe("military/+/data");
  mqttClient.subscribe("military/+/acknowledgment");
});
mqttClient.on("message", handleMqttMessage);

// Express App Setup
const app = express();
app.use(helmet());
app.use(bodyParser.json());

// MQTT Message Handler: Store incoming messages as logs
async function handleMqttMessage(topic, message) {
  try {
    const payload = JSON.parse(message.toString());
    console.log(`[MQTT] [${payload.unitId}] Received message on ${topic}: ${message}`);

    if (topic.endsWith("/data")) {
      // Save data logs
      const newLog = new Log(payload);
      await newLog.save();
      console.log(`[MQTT] [${payload.unitId}] Data saved to logs`);
    } else if (topic.endsWith("/acknowledgment")) {
      // Update command status based on acknowledgment

      try {
        await Command.findByIdAndUpdate({ _id: payload.id }, { $set: { acknowledged: true } }, { new: true });
      } catch (error) {
        console.error(`[MQTT] Error updating command status for ${unitId}:`, error);
      }
    }
  } catch (error) {
    console.error("[MQTT] Error processing message:", error);
  }
}

// Register a New Unit
app.post("/api/unit/register", async (req, res) => {
  try {
    const { unitId, description } = req.body;

    if (!unitId) {
      return res.status(400).json({ error: "unitId is required" });
    }

    const newUnit = new Unit({ unitId, description });
    await newUnit.save();

    console.log(`[HTTP] [${unitId}] Unit registered: ${JSON.stringify(req.body)}`);
    res.status(201).json({ message: "Unit registered successfully", unit: newUnit });
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ error: "Unit ID already exists" });
    } else {
      console.error("[HTTP] Error registering unit:", error);
      res.status(500).json({ error: "Failed to register unit" });
    }
  }
});

// Save Log Data via HTTP
app.post("/api/unit/log", async (req, res) => {
  try {
    const logData = req.body;

    const newLog = new Log(logData);
    await newLog.save();

    console.log(`[HTTP] [${logData.unitId}] Log saved: ${JSON.stringify(logData)}`);
    res.status(200).json({ message: "Log data saved successfully" });
  } catch (error) {
    console.error("[HTTP] Error saving log data:", error);
    res.status(500).json({ error: "Failed to save log data" });
  }
});

// Issue Command to Unit via MQTT and Save to Command Collection
app.post("/api/unit/command", async (req, res) => {
  try {
    const { unitId, command, payload } = req.body;

    if (!unitId || !command) {
      return res.status(400).json({ error: "Missing unitId or command" });
    }

    // Save the command to the Command collection
    const newCommand = new Command({ unitId, command, commandPayload: payload });
    await newCommand.save();

    const commandPayload = { ...payload, id: newCommand._id };

    // MQTT topic for the specific command
    const topic = `military/${unitId}/actuators/${command}`;
    mqttClient.publish(topic, JSON.stringify(commandPayload));

    console.log(`[HTTP] [${unitId}] Command sent: ${command} - Payload: ${JSON.stringify(commandPayload)}`);

    res.status(200).json({ message: "Command sent successfully", unitId, command, payload: commandPayload });
  } catch (error) {
    console.error("[HTTP] Error sending command:", error);
    res.status(500).json({ error: "Failed to send command" });
  }
});

// Fetch All Registered Units
app.get("/api/units", async (req, res) => {
  try {
    const units = await Unit.find({});
    res.status(200).json(units);
  } catch (error) {
    console.error("[HTTP] Error fetching units:", error);
    res.status(500).json({ error: "Failed to fetch units" });
  }
});

app.get("/api/unit/:unitId", async (req, res) => {
  try {
    const { unitId } = req.params;

    const unit = await Unit.findOne({ unitId }).exec();
    if (!unit) {
      return res.status(404).json({ error: `Unit not found for ID: ${unitId}` });
    }

    res.status(200).json(unit);
  } catch (error) {
    console.error("[HTTP] Error fetching unit:", error);
    res.status(500).json({ error: "Failed to fetch unit" });
  }
});

// Fetch Latest Data for a Specific Unit
app.get("/api/unit/:unitId/latest", async (req, res) => {
  try {
    const { unitId } = req.params;

    const latestLog = await Log.findOne({ unitId }).sort({ timestamp: -1 }).exec();

    if (!latestLog) {
      return res.status(404).json({ error: `No data found for unitId: ${unitId}` });
    }

    res.status(200).json(latestLog);
  } catch (error) {
    console.error(`[HTTP] Error fetching latest data for ${req.params.unitId}:`, error);
    res.status(500).json({ error: "Failed to fetch latest unit data" });
  }
});

app.get("/api/unit/:unitId/commands", async (req, res) => {
  try {
    const { unitId } = req.params;

    const commands = await Command.find({ unitId }).exec();
    res.status(200).json(commands);
  } catch (error) {
    console.error(`[HTTP] Error fetching commands for ${req.params.unitId}:`, error);
    res.status(500).json({ error: "Failed to fetch commands" });
  }
});

// Route to Unit List Page (index.html)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route to Unit Monitor Page (monitor.html)
app.get("/monitor", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "monitor.html"));
});

// Start the Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
