import React, { useEffect, useState } from 'react';
import './AlertIndicator.css';

const AlertIndicator = ({ type, active, timestamp, value = 0 }) => {
  const [pulse, setPulse] = useState(false);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (active) {
      setPulse(true);
      const timer = setTimeout(() => setPulse(false), 500);
      
      // For smoke, make it blink continuously
      if (type === 'smoke') {
        const blinkInterval = setInterval(() => {
          setBlink(prev => !prev);
        }, 1000);
        return () => clearInterval(blinkInterval);
      }
      
      return () => clearTimeout(timer);
    } else {
      setBlink(false);
    }
  }, [active, type]);

  const config = {
    doorbell: {
      icon: '🚪',
      label: 'Doorbell',
      activeColor: '#4CAF50',
      inactiveColor: '#9E9E9E',
      message: 'Someone is at the door!',
      unit: '',
      valueLabel: 'Status'
    },
    smoke: {
      icon: '🔥',
      label: 'Smoke Sensor',
      activeColor: '#F44336',
      inactiveColor: '#9E9E9E',
      message: 'Smoke detected! Alert!',
      unit: ' units',
      valueLabel: 'Level'
    }
  };

  const { icon, label, activeColor, inactiveColor, message, unit, valueLabel } = config[type];

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getValueDisplay = () => {
    if (type === 'doorbell') {
      return active ? 'PRESSED' : 'READY';
    } else {
      return `${value}${unit}`;
    }
  };

  return (
    <div className={`alert-indicator ${active ? 'active' : 'inactive'} ${pulse ? 'pulse' : ''} ${blink ? 'blink' : ''}`}>
      <div className="alert-header">
        <div 
          className="alert-light"
          style={{
            backgroundColor: active ? activeColor : inactiveColor,
            boxShadow: active ? `0 0 20px ${activeColor}` : 'none',
            animation: blink ? 'blink 1s infinite' : 'none'
          }}
        >
          <span className="alert-icon">{icon}</span>
        </div>
        
        <div className="alert-title">
          <h3 className="alert-label">{label}</h3>
          <div className="alert-value">
            <span className="value-label">{valueLabel}:</span>
            <span className={`value-display ${active ? 'value-active' : 'value-inactive'}`}>
              {getValueDisplay()}
            </span>
          </div>
        </div>
      </div>
      
      <div className="alert-info">
        <p className={`alert-status ${active ? 'status-active' : 'status-inactive'}`}>
          {active ? (
            <span className="alert-message">
              <span className="alert-icon-small">{icon}</span>
              {message}
            </span>
          ) : (
            <span className="normal-status">
              No alerts detected
            </span>
          )}
        </p>
        
        {active && timestamp && (
          <div className="alert-time-container">
            <span className="time-icon">⏰</span>
            <span className="alert-time">{formatTime(timestamp)}</span>
          </div>
        )}
      </div>

      {active && (
        <div className="alert-badge">
          <span className="badge-text">
            {type === 'doorbell' ? 'RINGING' : 'DANGER'}
          </span>
        </div>
      )}
    </div>
  );
};

export default AlertIndicator;