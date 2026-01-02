# Quick Start Guide - Control Panel Setup

## 🚀 Get Running in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start the Control Panel
```bash
npm start
```
Opens at `http://localhost:3000`

### Step 3: Test Without Arduino (Optional)
In a new terminal, run the test API server:
```bash
node example-api-server.js
```

Then in the control panel:
- Change API URL to: `http://localhost:3001/api`
- You should see "🟢 Connected"
- Test by sending: 
  ```bash
  curl -X POST http://localhost:3001/api/trigger -H "Content-Type: application/json" -d '{"type":"doorbell"}'
  ```

## 🔌 Connecting Your Arduino/ESP32

### What Your Device Needs to Do:

1. **Create a WiFi/Ethernet server**
2. **Expose this endpoint:**
   ```
   GET /api/status
   ```
3. **Return JSON in this format:**
   ```json
   {
     "doorbell": 0,  // 0 = off, 1 = on
     "smoke": 0      // 0 = off, 1 = on
   }
   ```

### ESP32 Example Code Structure:

```cpp
#include <WiFi.h>
#include <WebServer.h>

WebServer server(80);
const int DOORBELL_PIN = 2;
const int SMOKE_PIN = 4;

void handleStatus() {
  int doorbell = digitalRead(DOORBELL_PIN);
  int smoke = digitalRead(SMOKE_PIN);
  
  String json = "{";
  json += "\"doorbell\":" + String(doorbell) + ",";
  json += "\"smoke\":" + String(smoke);
  json += "}";
  
  server.send(200, "application/json", json);
}

void setup() {
  Serial.begin(115200);
  pinMode(DOORBELL_PIN, INPUT);
  pinMode(SMOKE_PIN, INPUT);
  
  // Connect to WiFi
  WiFi.begin("YOUR_SSID", "YOUR_PASSWORD");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi connected!");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  
  server.on("/api/status", handleStatus);
  server.begin();
}

void loop() {
  server.handleClient();
}
```

### Update Control Panel API URL:

1. Find your ESP32's IP address (check Serial Monitor)
2. In the control panel header, change API URL to:
   ```
   http://YOUR_ESP32_IP/api
   ```
   Example: `http://192.168.1.100/api`

## ✅ Testing Checklist

- [ ] Control panel opens in browser
- [ ] Demo mode works (test buttons appear when disconnected)
- [ ] Test buttons trigger alerts
- [ ] History saves events
- [ ] Arduino/ESP32 connected to WiFi
- [ ] API endpoint responds correctly
- [ ] Control panel shows "Connected"
- [ ] Doorbell press triggers alert
- [ ] Smoke sensor triggers alert

## 🎯 For Your Demo

1. **Show the control panel** - Beautiful UI with real-time updates
2. **Press doorbell** - Show green alert appears
3. **Trigger smoke sensor** - Show red alert appears
4. **Show history** - Scroll through past events
5. **Explain integration** - How React Native app gets same data

## 🐛 Troubleshooting

**"Disconnected (Demo Mode)"**
- Check API URL is correct
- Verify Arduino is on same network
- Check Arduino Serial Monitor for errors
- Try accessing API URL directly in browser

**Alerts not showing**
- Check browser console (F12) for errors
- Verify API returns correct JSON format
- Check sensor pins are connected correctly

**History not saving**
- Check browser allows localStorage
- Clear browser cache if needed

## 📱 Integration with React Native App

Your React Native app can:
- Poll the same `/api/status` endpoint
- Show notifications/vibrations when sensors trigger
- Both web and app show same real-time data!

Good luck! 🎉



