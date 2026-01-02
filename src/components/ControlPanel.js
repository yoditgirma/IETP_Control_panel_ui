import React, { useState, useEffect, useCallback, useRef } from 'react';
import AlertIndicator from './AlertIndicator';
import HistoryPanel from './HistoryPanel';
import DemoControls from './DemoControls';
import { deviceAPI } from '../services/deviceAPI';
import './ControlPanel.css';

const ControlPanel = () => {
  const [alerts, setAlerts] = useState({
    doorbell: { active: false, timestamp: null, value: 0 },
    smoke: { active: false, timestamp: null, value: 0 }
  });
  const [history, setHistory] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [apiUrl, setApiUrl] = useState('http://localhost:3001/api');
  const [isPolling, setIsPolling] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('🔴 Connecting...');
  
  // Refs to prevent duplicate alerts
  const lastDoorbellState = useRef(false);
  const lastSmokeState = useRef(false);
  const pollIntervalRef = useRef(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('deviceHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleAlert = useCallback((type, isActive, value = 0) => {
    console.log(`${type} alert: ${isActive ? 'ACTIVE' : 'INACTIVE'}, value: ${value}`);
    
    const timestamp = new Date().toISOString();

    setAlerts(prev => ({
      ...prev,
      [type]: {
        active: isActive,
        timestamp: isActive ? timestamp : prev[type].timestamp,
        value: value
      }
    }));

    // Add to history only when alert becomes active
    if (isActive) {
      const historyEntry = {
        id: Date.now(),
        type,
        timestamp,
        value,
        message: type === 'doorbell' 
          ? '🚪 Doorbell pressed!' 
          : `🔥 Smoke detected! Level: ${value}`
      };
      
      setHistory(prevHistory => {
        const newHistory = [historyEntry, ...prevHistory].slice(0, 100);
        localStorage.setItem('deviceHistory', JSON.stringify(newHistory));
        return newHistory;
      });

      // Auto-reset doorbell after 5 seconds
      if (type === 'doorbell') {
        setTimeout(() => {
          setAlerts(prev => ({
            ...prev,
            doorbell: { ...prev.doorbell, active: false }
          }));
        }, 5000);
      }
    }
  }, []);

  // Play alert sound
  const playAlertSound = useCallback((type) => {
    try {
      if (type === 'doorbell') {
        // Doorbell sound
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
        oscillator.stop(audioContext.currentTime + 1);
        
      } else if (type === 'smoke') {
        // Smoke alarm sound (beeping)
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 1000;
        oscillator.type = 'square';
        
        // Create beeping pattern
        const currentTime = audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.1);
        gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.2);
        gainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.4);
        gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.5);
        gainNode.gain.linearRampToValueAtTime(0.2, currentTime + 0.7);
        gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.8);
        
        oscillator.start();
        oscillator.stop(currentTime + 1);
      }
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  }, []);

  // Poll device API for real-time updates
  const pollDevice = useCallback(async () => {
    if (!isPolling) return;
    
    try {
      const data = await deviceAPI.getStatus();
      
      if (data) {
        setIsConnected(true);
        setConnectionStatus('🟢 Connected to ESP32');
        
        // Check for doorbell signal from ESP32
        const doorbellActive = data.doorbell === 1 || data.doorbell === true;
        if (doorbellActive !== lastDoorbellState.current) {
          lastDoorbellState.current = doorbellActive;
          if (doorbellActive) {
            handleAlert('doorbell', true, 1);
            playAlertSound('doorbell');
          } else {
            handleAlert('doorbell', false, 0);
          }
        }

        // Check for smoke signal from ESP32
        const smokeActive = data.smoke === 1 || data.smoke === true || data.smokeValue > 300;
        if (smokeActive !== lastSmokeState.current) {
          lastSmokeState.current = smokeActive;
          if (smokeActive) {
            handleAlert('smoke', true, data.smokeValue || 500);
            playAlertSound('smoke');
          } else {
            handleAlert('smoke', false, data.smokeValue || 0);
          }
        }
        
        // Update smoke value even if not active
        if (data.smokeValue !== undefined) {
          setAlerts(prev => ({
            ...prev,
            smoke: { ...prev.smoke, value: data.smokeValue }
          }));
        }
        
      } else {
        setIsConnected(false);
        setConnectionStatus('🔴 Disconnected (ESP32 Offline)');
      }
    } catch (error) {
      console.log('Polling error:', error.message);
      setIsConnected(false);
      setConnectionStatus('🔴 Connection Error');
    }
  }, [handleAlert, playAlertSound, isPolling]);

  // Start polling
  useEffect(() => {
    pollDevice(); // Initial poll
    
    pollIntervalRef.current = setInterval(pollDevice, 2000); // Poll every 2 seconds
    
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [pollDevice]);

  // Manual trigger for testing
  const triggerManualTest = (type) => {
    if (type === 'doorbell') {
      handleAlert('doorbell', true, 1);
      playAlertSound('doorbell');
      setTimeout(() => handleAlert('doorbell', false, 0), 5000);
    } else if (type === 'smoke') {
      handleAlert('smoke', true, 750);
      playAlertSound('smoke');
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('deviceHistory');
  };

  const resetSmokeAlert = () => {
    handleAlert('smoke', false, 0);
  };

  const togglePolling = () => {
    setIsPolling(!isPolling);
    if (pollIntervalRef.current && !isPolling) {
      pollIntervalRef.current = setInterval(pollDevice, 2000);
    } else if (pollIntervalRef.current && isPolling) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  return (
    <div className="control-panel">
      <header className="panel-header">
        <h1>🏠 Smart Home Control Panel</h1>
        <p className="subtitle">Real-time Monitoring for Hearing Impaired</p>
        
        <div className="connection-status">
          <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            {connectionStatus}
          </span>
          <span className="polling-status">
            Polling: {isPolling ? '🟢 ON' : '🔴 OFF'}
            <button onClick={togglePolling} className="polling-toggle">
              {isPolling ? 'Pause' : 'Resume'}
            </button>
          </span>
        </div>

        <div className="api-config">
          <div className="config-group">
            <label>
              API URL:
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:3001/api"
              />
            </label>
            <button 
              onClick={() => pollDevice()} 
              className="refresh-btn"
              title="Force refresh from ESP32"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Real-time Status Panel */}
      <div className="status-panel">
        <div className="status-card">
          <h3>📡 ESP32 Status</h3>
          <div className="status-details">
            <p><strong>Connection:</strong> {isConnected ? 'Live' : 'Offline'}</p>
            <p><strong>Last Update:</strong> {new Date().toLocaleTimeString()}</p>
            <p><strong>Polling Rate:</strong> 2 seconds</p>
          </div>
        </div>
        
        <div className="status-card">
          <h3>🔧 Manual Test Controls</h3>
          <div className="test-buttons">
            <button 
              onClick={() => triggerManualTest('doorbell')}
              className="test-btn doorbell-test"
            >
              🚪 Test Doorbell
            </button>
            <button 
              onClick={() => triggerManualTest('smoke')}
              className="test-btn smoke-test"
            >
              🔥 Test Smoke Alert
            </button>
            <button 
              onClick={resetSmokeAlert}
              className="test-btn reset-test"
              disabled={!alerts.smoke.active}
            >
              🔄 Reset Smoke
            </button>
          </div>
        </div>
      </div>

      {/* Alerts Display */}
      <div className="alerts-container">
        <AlertIndicator
          type="doorbell"
          active={alerts.doorbell.active}
          timestamp={alerts.doorbell.timestamp}
          value={alerts.doorbell.value}
        />
        <AlertIndicator
          type="smoke"
          active={alerts.smoke.active}
          timestamp={alerts.smoke.timestamp}
          value={alerts.smoke.value}
        />
      </div>

      {/* Demo mode notification */}
      {!isConnected && (
        <div className="demo-notice">
          <div className="demo-warning">
            ⚠️ <strong>Demo Mode Active</strong> - ESP32 not detected
            <p>Using simulated data. Connect your ESP32 to see real alerts.</p>
            <DemoControls onTriggerAlert={handleAlert} />
          </div>
        </div>
      )}

      <HistoryPanel history={history} clearHistory={clearHistory} />
    </div>
  );
};

export default ControlPanel;