/**
 * REAL API SERVER (Connected to ESP32)
 * Run: node api-server.js
 */

const http = require('http');
const url = require('url');

// 🔴 CHANGE THIS TO YOUR ESP32 IP
const ESP32_IP = 'http://192.168.1.10'; // example
const ESP32_STATUS_API = `${ESP32_IP}/api/status`;

const server = http.createServer(async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  // ✅ GET /api/status (Proxy to ESP32)
  if (parsedUrl.pathname === '/api/status' && req.method === 'GET') {
    try {
      const esp32Res = await fetch(ESP32_STATUS_API);
      const data = await esp32Res.json();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        doorbell: data.buttonPressed ? 1 : 0,
        smoke: data.smokeDetected ? 1 : 0,
        smokeValue: data.smokeValue
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'ESP32 not reachable',
        details: err.message
      }));
    }
    return;
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying ESP32 from ${ESP32_STATUS_API}`);
  console.log(`➡ React should call: http://localhost:${PORT}/api/status`);
});
