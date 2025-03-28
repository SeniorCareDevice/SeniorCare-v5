const ws = new WebSocket(`ws://${window.location.host}`);
let map, marker;
let lastUpdate = 0;

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  // Update Gauges
  updateGauge('tempGauge', 'Temperature (°C)', data.temperature, 0, 50, '#3498db');
  updateGauge('heartGauge', 'Heart Rate (BPM)', data.heartRate, 0, 200, '#e74c3c');
  updateGauge('spo2Gauge', 'SpO2 (%)', data.spO2, 0, 100, '#2ecc71');

  // Fall Status
  const fallStatus = document.getElementById('fallStatus');
  fallStatus.textContent = data.fallStatus;
  fallStatus.style.backgroundColor = data.fallStatus === 'Fall Detected' ? '#e74c3c' : '#2ecc71';
  fallStatus.style.color = 'white';

  // Map Update (every 60 seconds)
  const now = Date.now();
  if (now - lastUpdate > 60000 && data.latitude && data.longitude) {
    updateMap(data.latitude, data.longitude);
    lastUpdate = now;
  }
};

function updateGauge(id, label, value, min, max, color) {
  if (!window[id]) {
    window[id] = new JustGage({
      id: id,
      value: value,
      min: min,
      max: max,
      title: label,
      label: '',
      gaugeWidthScale: 0.6,
      valueFontColor: '#333',
      titleFontColor: '#333',
      gaugeColor: '#ecf0f1',
      levelColors: [color]
    });
  } else {
    window[id].refresh(value);
  }
}

function initMap(lat, lng) {
  map = L.map('map').setView([lat, lng], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  marker = L.marker([lat, lng]).addTo(map);
}

function updateMap(lat, lng) {
  if (!map) {
    initMap(lat, lng);
  } else {
    map.setView([lat, lng], 13);
    marker.setLatLng([lat, lng]);
  }
}

document.getElementById('restartMap').addEventListener('click', () => {
  const data = JSON.parse(ws.latestMessage || '{}');
  if (data.latitude && data.longitude) {
    updateMap(data.latitude, data.longitude);
    lastUpdate = Date.now();
  }
});