// Mock Data: Units with Latest Data
const units = [
  {
    unitId: "unit_001",
    mode: "standby",
    alarmStatus: false,
    temperature: "21.5",
    gps: { lat: "-33.865143", lon: "151.209900" }, // Sydney
    speed: "0",
    timestamp: "2024-10-13T01:30:00.000Z",
  },
  {
    unitId: "unit_002",
    mode: "patrol",
    alarmStatus: true,
    temperature: "19.18",
    gps: { lat: "-37.852421", lon: "145.112290" }, // Melbourne
    speed: "9.97",
    timestamp: "2024-10-13T01:41:05.273Z",
  },
];

// Populate Unit List (index.html)
const unitList = document.getElementById("unit-list");
if (unitList) {
  units.forEach((unit) => {
    const div = document.createElement("div");
    div.classList.add("mui-panel");
    div.innerHTML = `
        <h3>${unit.unitId}</h3>
        <p>Mode: ${unit.mode}</p>
        <p>Status: ${unit.alarmStatus ? "Alarm On" : "Alarm Off"}</p>
        <a href="monitor.html?unitId=${unit.unitId}">Monitor</a>
      `;
    unitList.appendChild(div);
  });
}

// Get Query Parameter from URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Monitor Unit Data (monitor.html)
const unitInfo = document.getElementById("unit-info");
const mapContainer = document.getElementById("map");
const speedChartCtx = document.getElementById("speedChart")?.getContext("2d");

if (unitInfo && mapContainer) {
  const unitId = getQueryParam("unitId");
  const unit = units.find((u) => u.unitId === unitId);

  if (unit) {
    // Display Unit Info
    unitInfo.innerHTML = `
        <h3>${unit.unitId}</h3>
        <p>Mode: ${unit.mode}</p>
        <p>Temperature: ${unit.temperature} °C</p>
        <p>Speed: ${unit.speed} km/h</p>
        <p>Status: ${unit.alarmStatus ? "Alarm On" : "Alarm Off"}</p>
      `;

    // Initialize Map
    const map = L.map("map").setView([unit.gps.lat, unit.gps.lon], 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
    L.marker([unit.gps.lat, unit.gps.lon]).addTo(map).bindPopup(`${unit.unitId}`).openPopup();

    // Render Speed Chart
    new Chart(speedChartCtx, {
      type: "line",
      data: {
        labels: ["Start", "Now"],
        datasets: [
          {
            label: "Speed (km/h)",
            data: [0, parseFloat(unit.speed)],
            borderColor: "rgba(75, 192, 192, 1)",
            fill: false,
          },
        ],
      },
    });
  } else {
    unitInfo.innerHTML = `<p>Unit not found.</p>`;
  }
}
