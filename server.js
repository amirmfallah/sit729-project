// server.js
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const SensorData = require("./models/sensors");
const dotenv = require("dotenv");

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Connect to the MQTT broker
const mqtt = require("mqtt");
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");
const topic = "deakin/amir";

client.on("connect", () => {
  client.subscribe(topic, (err) => {
    if (err) {
      console.error("Error subscribing to topic:", err);
    } else {
      console.log("Subscribed to topic:", topic);
    }
  });
});

// Connect to MongoDB using Mongoose
const mongoUrl = process.env.MONGO_URI;

mongoose.connect(mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.on("message", async (topic, message) => {
  const data = JSON.parse(message.toString());
  console.log("Received message from MQTT broker:", data);

  // Create a new sensor data document
  const newSensorData = new SensorData({
    sensorId: data.sensorId,
    value: data.value,
    latitude: data.location?.latitude,
    longitude: data.location?.longitude,
    timestamp: new Date(),
    sensorName: data.sensorName,
  });

  // Save the data to MongoDB
  try {
    await newSensorData.save();
    console.log("Sensor data saved to MongoDB:", newSensorData);
  } catch (err) {
    console.error("Error saving sensor data:", err);
  }

  // Emit the sensor data to all connected clients via Socket.io
  io.emit("sensorData", data);
});

// Serve static files (for the frontend)
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
