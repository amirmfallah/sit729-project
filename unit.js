const mqtt = require("mqtt");
const axios = require("axios");

class MilitaryUnit {
  constructor(unitId, brokerUrl, apiUrl) {
    this.unitId = unitId;
    this.mode = "standby";
    this.alarmStatus = false;
    this.client = mqtt.connect(brokerUrl);
    this.latitude = -37.85;
    this.longitude = 145.115;
    this.apiUrl = apiUrl;

    this.initializeUnit();
    this.setupMqtt();
  }

  async initializeUnit() {
    try {
      const response = await this.getUnitInfo();

      if (response) {
        console.log(`[${this.unitId}] Unit found:`, response.data);
      } else {
        console.log(`[${this.unitId}] Unit not found. Registering new unit...`);
        await this.registerUnit();
      }
    } catch (error) {
      console.error(`[${this.unitId}] Error during initialization: ${error.message}`);
    }
  }

  // Fetch Unit Info from the API
  async getUnitInfo() {
    try {
      const response = await axios.get(`${this.apiUrl}/api/unit/${this.unitId}`);
      return response.status === 200 ? response : null;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log(`[${this.unitId}] Unit not found (404).`);
        return null;
      }
      throw new Error(`Failed to fetch unit info: ${error.message}`);
    }
  }

  // Register the unit via HTTP POST
  async registerUnit() {
    try {
      const unitData = {
        unitId: this.unitId,
        description: `Unit ${this.unitId} - Default Description`,
      };

      const response = await axios.post(`${this.apiUrl}/api/unit/register`, unitData);
      console.log(`[${this.unitId}] Unit registered successfully:`, response.data);
    } catch (error) {
      console.error(`[${this.unitId}] Unit registration failed:`, error.message);
    }
  }

  // Setup MQTT connections and subscriptions
  setupMqtt() {
    this.client.on("connect", () => {
      console.log(`[${this.unitId}] MQTT Connected`);
      this.client.subscribe(`military/${this.unitId}/actuators/#`, (err) => {
        if (!err) console.log(`[${this.unitId}] Subscribed to actuator topics`);
      });
    });

    this.client.on("message", (topic, message) => {
      this.handleMessage(topic, message);
    });

    this.client.on("error", (err) => {
      console.error(`[${this.unitId}] MQTT Error: ${err}`);
    });

    // Publish sensor data every 5 seconds
    setInterval(() => this.publishSensorData(), 5000);
  }

  // Handle incoming MQTT messages
  handleMessage(topic, message) {
    console.log(`[${this.unitId}] Received message on ${topic}: ${message.toString()}`);

    try {
      const payload = JSON.parse(message.toString());

      if (topic.endsWith("/actuators/mode")) {
        this.switchMode(payload.mode);
        this.sendAcknowledgment("mode", payload.mode);
      } else if (topic.endsWith("/actuators/alarm")) {
        this.triggerAlarm(payload.trigger);
        this.sendAcknowledgment("alarm", payload.trigger ? "triggered" : "reset");
      }
    } catch (err) {
      console.error(`[${this.unitId}] Invalid message format: ${err}`);
    }
  }

  // Publish sensor data
  publishSensorData() {
    const data = {
      unitId: this.unitId,
      mode: this.mode,
      alarmStatus: this.alarmStatus,
      temperature: this.getTemperature(),
      gps: this.getGpsCoordinates(),
      speed: this.getSpeed(),
      timestamp: new Date().toISOString(),
    };

    this.client.publish(`military/${this.unitId}/data`, JSON.stringify(data));
    console.log(`[${this.unitId}] Published data: ${JSON.stringify(data)}`);
  }

  // Publish a message to a specific topic
  publish(topicSuffix, message) {
    const topic = `military/${this.unitId}/${topicSuffix}`;
    this.client.publish(topic, JSON.stringify(message));
  }

  // Switch the mode of the unit
  switchMode(newMode) {
    this.mode = newMode;
    console.log(`[${this.unitId}] Mode switched to: ${this.mode}`);
    this.publish("status/mode", { mode: this.mode, timestamp: new Date().toISOString() });
  }

  // Trigger or reset the alarm
  triggerAlarm(trigger) {
    this.alarmStatus = trigger;
    const status = this.alarmStatus ? "Alarm Triggered!" : "Alarm Reset!";
    console.log(`[${this.unitId}] ${status}`);
    this.publish("status/alarm", { alarm: this.alarmStatus, timestamp: new Date().toISOString() });
  }

  // Send acknowledgment after processing an actuator command
  sendAcknowledgment(type, status) {
    const ackMessage = {
      unitId: this.unitId,
      type,
      status,
      timestamp: new Date().toISOString(),
    };
    this.publish("acknowledgment", ackMessage);
    console.log(`[${this.unitId}] Acknowledgment sent: ${JSON.stringify(ackMessage)}`);
  }

  // Simulate temperature sensor data
  getTemperature() {
    return (Math.random() * 15 + 10).toFixed(2); // Random temp between 10-25°C
  }

  // Simulate GPS coordinates
  getGpsCoordinates() {
    const latOffset = Math.random() * 0.01 - 0.005; // ±0.005° (~500 meters)
    const lonOffset = Math.random() * 0.01 - 0.005; // ±0.005° (~500 meters)

    let newLat = this.latitude + latOffset;
    let newLon = this.longitude + lonOffset;

    // Constrain within Burwood's area
    newLat = Math.min(Math.max(newLat, -37.855), -37.845);
    newLon = Math.min(Math.max(newLon, 145.11), 145.12);

    this.latitude = newLat;
    this.longitude = newLon;

    return { lat: newLat.toFixed(6), lon: newLon.toFixed(6) };
  }

  // Simulate speed sensor data
  getSpeed() {
    return (Math.random() * 100).toFixed(2); // Random speed between 0-100 km/h
  }
}

module.exports = MilitaryUnit;
