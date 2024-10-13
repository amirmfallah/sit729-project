const MilitaryUnit = require("./unit");

class SimulationClient {
  constructor(numUnits, brokerUrl, apiUrl) {
    this.units = [];
    this.numUnits = numUnits;
    this.brokerUrl = brokerUrl;
    this.apiUrl = apiUrl;

    this.launchUnits();
  }

  // Launch the specified number of units
  launchUnits() {
    for (let i = 1; i <= this.numUnits; i++) {
      const unitId = `unit_${String(i).padStart(3, "0")}`;
      const unit = new MilitaryUnit(unitId, this.brokerUrl, this.apiUrl);
      this.units.push(unit);
      console.log(`Launched ${unitId}`);
    }
  }

  // Helper to get a random unit from the list
  getRandomUnit() {
    const index = Math.floor(Math.random() * this.units.length);
    return this.units[index];
  }
}

const numUnits = 5;
const brokerUrl = "mqtt://broker.hivemq.com";
const apiUrl = "http://sit729-1604877711.us-east-1.elb.amazonaws.com";

new SimulationClient(numUnits, brokerUrl, apiUrl);
