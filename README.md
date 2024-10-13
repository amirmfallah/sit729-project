# **IoT Solution for Autonomous Operations**

This repository contains the complete source code and configuration files for the **IoT Solution for Autonomous Operations**. This system enables real-time monitoring and remote management of multiple autonomous units via **MQTT messaging**, **Node.js microservices**, **Node-RED automation**, and a **web-based dashboard**. The backend is containerized with **Docker** for easy deployment on **AWS EC2 instances** with **scalability** using load balancing and auto-scaling.

---

## **Features**

- **Real-Time Monitoring:** Units publish GPS location, speed, and temperature data every 5 seconds via MQTT.
- **Command Execution:** Operators can trigger alarms and switch unit modes through the web-based dashboard.
- **Automated Alerts:** Node-RED workflows trigger alerts when sensor values exceed thresholds (e.g., GPS boundaries, speed limits, temperature anomalies).
- **Scalable Deployment:** Dockerized services deployed on AWS EC2 instances with a load balancer and auto-scaling.
- **Secure Communication:** Future-ready for TLS encryption and secure MQTT brokers.
- **MongoDB Database:** Stores unit data, commands, and logs.

---

## **Repository Structure**

```
.
├── Dockerfile
├── README.md
├── docker-compose.yaml
├── flows.json
├── models
│   ├── command.js
│   ├── logs.js
│   └── unit.js
├── package-lock.json
├── package.json
├── public
│   ├── css
│   ├── index.html
│   ├── js
│   └── monitor.html
├── server.js
├── simulation_client.js
└── unit.js
```

---

## **Setup Instructions**

### **Prerequisites**

- **Node.js** and **npm** installed on your local machine.
- **Docker** and **Docker Compose** for container management.
- **MongoDB database URI** (for example, a cloud MongoDB instance).
- **AWS Account** for EC2 instance deployment (if deploying to the cloud).

---

### **1. Clone the Repository**

```bash
git clone https://github.com/amirmfallah/sit729-project.git
cd sit729-project
```

---

### **2. Install Dependencies**

```bash
npm install
```

---

### **3. Create a `.env` File**

Add the following environment variables in a `.env` file:

```
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/myDatabase
PORT=3000
```

---

### **4. Run the Backend Locally**

```bash
node server.js
```

Access the backend at: `http://localhost:3000`

---

### **5. Launch Unit Simulations**

```bash
node simulation/simulation_client.js
```

The simulation will start generating data streams for multiple units every 5 seconds.

---

### **6. Docker Deployment**

To build and run the containers using Docker Compose:

```bash
docker-compose up -d
```

This will start the backend in a Docker container on port 80.

---

### **7. AWS Deployment (Optional)**

1. Launch **EC2 instances** via AWS.
2. Install **Docker** on each instance.
3. Clone this repository on the instances.
4. Run the backend services using `docker-compose up -d`.
5. Configure an **AWS Load Balancer** to distribute traffic across the instances.

---

## **API Endpoints**

- **POST /api/unit/register:** Register a new unit.
- **GET /api/unit/:unitId/latest:** Fetch the latest data for a unit.
- **POST /api/unit/command:** Send a command to a specific unit.
- **GET /api/unit/:unitId/commands:** Fetch the command history for a unit.

---

## **System Features in Detail**

1. **Real-Time Monitoring:**  
   Units continuously publish sensor data to an **MQTT broker**. The backend subscribes to relevant topics to receive and store data in **MongoDB**.

2. **Automated Alerts with Node-RED:**

   - **Temperature Alert:** Triggers an alarm if the temperature goes outside the safe range (10°C - 35°C).
   - **Speed Alert:** Sends a warning if the speed exceeds 80 km/h.
   - **GPS Boundary Alert:** Notifies if a unit moves outside the defined location boundary.

3. **Command Handling and Acknowledgment:**
   - Operators send commands (e.g., mode change or trigger alarm) via the web dashboard.
   - The backend publishes commands to MQTT topics, and units send **acknowledgments** after receiving the commands.

---

## **Monitoring Dashboard**

The web-based dashboard allows operators to:

- **Monitor real-time data** such as GPS, speed, and temperature.
- **Trigger alarms** and **switch unit modes** remotely.
- **View command history** with acknowledgment status for each unit.

---

## **Screenshots**

![Screenshot 2024-10-13 at 18 48 38](https://github.com/user-attachments/assets/8ea1a154-5799-428c-8ca6-2d83bd7bba17)

---

## **Future Enhancements**

- **TLS-Encrypted MQTT Communication:**  
  Upgrade to a **secure MQTT broker** with TLS encryption for better data security.

- **User Authentication and Role-Based Access Control (RBAC):**  
  Add **authentication** for dashboard access and restrict critical commands to specific roles.
