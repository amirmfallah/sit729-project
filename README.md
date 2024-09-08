## Features

- Real-time data collection from temperature and GPS sensors.
- Secure communication using the MQTT protocol.
- Real-time visualization of sensor data via a web interface.
- Data persistence using MongoDB for historical tracking.
- Scalable design leveraging cloud services such as AWS IoT Core, Timestream, and DynamoDB.

## Technologies Used

- **Node.js**: Backend server and MQTT client.
- **MongoDB**: Database for storing sensor data.
- **MQTT**: Messaging protocol for lightweight communication.
- **Socket.IO**: Real-time communication between server and web clients.
- **Express.js**: Web server framework.

## Prerequisites

To run the project locally, ensure that you have the following installed:

- Node.js (v12 or higher)
- MongoDB
- MQTT Broker (e.g., HiveMQ or Mosquitto)
- Git

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/amirmfallah/sit729-project.git
   cd sit729-project
   ```

2. Install the necessary dependencies:

   ```bash
   npm install
   ```

3. Set up your `.env` file with the required environment variables:

   ```bash
   MONGO_URI=your-mongodb-connection-string
   ```

4. Run the server:

   ```bash
   node server.js
   ```

5. (Optional) Modify `client.js` to point to your MQTT broker, or use the default settings:

   ```javascript
   const client = mqtt.connect("mqtt://broker.hivemq.com:1883");
   ```

6. Start the client to begin publishing sensor data:

   ```bash
   node client.js
   ```

## Running the Application

1. Once the server is running, navigate to `http://localhost:3000` in your browser to view real-time sensor data.
2. The client will start publishing random temperature and GPS data every 5-7 seconds, which is displayed on the web interface.

## Repository Structure

```plaintext
├── client.js         # Simulates the sensor data and sends it to the MQTT broker.
├── server.js         # Handles incoming MQTT data, stores it in MongoDB, and emits it via Socket.IO.
├── models/
│   └── sensors.js    # Mongoose schema for sensor data.
├── public/
│   └── index.html    # Frontend interface for real-time data visualization.
├── .env              # Environment variables (not included in repo).
├── README.md         # This file.
└── package.json      # Project metadata and dependencies.
```

## Demo

![demo](https://github.com/user-attachments/assets/1b060a5c-1baa-47b1-bacd-eab33e0a31a0)


_This is an example of a screenshot of the real-time dashboard showing sensor data._
