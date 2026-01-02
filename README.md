# Smart Home Control Panel - IETP Project

A real-time web-based control panel for monitoring smart home sensors (doorbell and smoke detector) designed for hearing-impaired individuals. This control panel provides visual alerts and maintains a history of all events.

## Features

- 🚪 **Real-time Doorbell Monitoring** - Visual alerts when doorbell is pressed
- 🔥 **Smoke Sensor Monitoring** - Immediate visual alerts for smoke detection
- 📋 **Event History** - Stores and displays all sensor events with timestamps
- 🔌 **API Integration** - Connects to Arduino/ESP32 devices via REST API
- 🎨 **Modern UI** - Beautiful, accessible interface with visual indicators
- 💾 **Local Storage** - History persists in browser localStorage

## Quick Start

### Installation

```bash
# Install dependencies
npm install

# Navigate to backend folder first
cd ietp/backend
npm run dev

# Start development server
cd ietp
npm start

```

The app will open at `http://localhost:3000`

### API Integration

The control panel polls your Arduino/ESP32 device API every 2 seconds. 

**Expected API Endpoint:**
```
GET /api/status
Response: { "doorbell": 0, "smoke": 0 }
```

**Update API URL:**
- The API URL can be configured in the control panel header
- Default: `http://localhost:3001/api`
- Change it to match your device's IP address and port

### Arduino/ESP32 Setup

Your device needs to expose a REST API endpoint. Here's what you need:

1. **WiFi Connection** (ESP32) or **Ethernet** (Arduino)
2. **HTTP Server** that responds to GET requests
3. **Sensor Reading** - Read doorbell and smoke sensor pins
4. **JSON Response** - Return status in format: `{"doorbell": 0, "smoke": 0}`

**Example ESP32 Code Structure:**
```cpp
#include <WiFi.h>
#include <WebServer.h>

WebServer server(80);

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
  // WiFi setup
  // Pin setup
  server.on("/api/status", handleStatus);
  server.begin();
}

void loop() {
  server.handleClient();
}
```

## Project Structure

```
ietp/
├── QUICK_START.md                    
├── backend/
│   ├── server.js
│   ├── package.json
│   └── node_modules/
├── src/
│   ├── components/
│   │   ├── ControlPanel.js          
│   │   ├── AlertIndicator.js        
│   │   └── ...
│   ├── services/
│   │   └── deviceAPI.js            
│   └── ...
├── package.json                     
└── ...
```

## Features Explained

### Visual Alerts
- **Green Light** - Doorbell indicator (active when pressed)
- **Red Light** - Smoke sensor indicator (active when smoke detected)
- **Pulsing Animation** - Visual feedback when alerts are triggered
- **Badge Notifications** - "ALERT" badge appears on active sensors

### History System
- Automatically logs all sensor events
- Stores up to 100 most recent events
- Persists in browser localStorage
- Shows date, time, and event type

### Connection Status
- Shows connection status to device API
- Falls back to demo mode if API unavailable
- Configurable API URL

## Demo Mode

If the API is not available, the control panel will show "Disconnected (Demo Mode)". You can still test the UI by manually triggering alerts (you can add test buttons if needed).

## Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Integration with React Native App

The React Native app can:
1. Receive push notifications/vibrations when sensors trigger
2. The web control panel shows the same real-time data
3. Both connect to the same Arduino/ESP32 API

## Troubleshooting

**API Connection Issues:**
- Check if your Arduino/ESP32 is on the same network
- Verify the API URL is correct (IP address and port)
- Ensure CORS is enabled on your device server
- Check firewall settings

**No Alerts Showing:**
- Verify sensors are properly connected to Arduino
- Check API response format matches expected JSON
- Open browser console for error messages

## Next Steps

1. **Deploy the web panel** - Use Netlify, Vercel, or any static hosting
2. **Set up your Arduino API** - Implement the `/api/status` endpoint
3. **Test integration** - Press doorbell and check if alerts appear
4. **Customize styling** - Adjust colors, animations as needed

## Support

For the IETP multidisciplinary project demo, this control panel provides:
- Real-time visual feedback
- Professional presentation
- Easy integration with existing hardware
- History tracking for demonstration

Good luck with your project! 🚀



