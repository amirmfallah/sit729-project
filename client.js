const mqtt = require("mqtt");

// Connect to the MQTT broker
const client = mqtt.connect("mqtt://broker.hivemq.com:1883");

// Topic to publish to
const topic = "deakin/amir";

// Simulate temperature sensor data
function generateTemperatureData() {
  const temperatureData = {
    sensorId: "temp-001",
    sensorName: "Temperature Sensor 1",
    value: (Math.random() * 15 + 20).toFixed(2), // Random temperature between 20 and 35
    type: "temperature",
  };

  return JSON.stringify(temperatureData);
}

// Simulate GPS sensor data
function generateGpsData() {
  const gpsData = {
    sensorId: "gps-001",
    sensorName: "GPS Sensor 1",
    location: {
      latitude: -37.84626,
      longitude: 145.10965,
    },
    type: "gps",
  };

  return JSON.stringify(gpsData);
}

// Publish temperature and GPS data alternately every 5 seconds
client.on("connect", () => {
  console.log("Sensor client connected to MQTT broker");

  // Publish temperature data every 5 seconds
  setInterval(() => {
    const temperatureMessage = generateTemperatureData();
    client.publish(topic, temperatureMessage, (err) => {
      if (err) {
        console.error("Error publishing temperature message:", err);
      } else {
        console.log("Published temperature message:", temperatureMessage);
      }
    });
  }, 5000); // Publish temperature data every 5 seconds

  // Publish GPS data every 7 seconds
  setInterval(() => {
    const gpsMessage = generateGpsData();
    client.publish(topic, gpsMessage, (err) => {
      if (err) {
        console.error("Error publishing GPS message:", err);
      } else {
        console.log("Published GPS message:", gpsMessage);
      }
    });
  }, 7000); // Publish GPS data every 7 seconds
});

// Handle connection errors
client.on("error", (err) => {
  console.error("Connection error:", err);
  client.end();
});
