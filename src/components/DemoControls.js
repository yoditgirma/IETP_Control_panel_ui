import React from 'react';
import './DemoControls.css';

const DemoControls = ({ onTriggerAlert }) => {
  return (
    <div className="demo-controls">
      <h3>🧪 Demo Controls (Testing)</h3>
      <div className="demo-buttons">
        <button 
          onClick={() => onTriggerAlert('doorbell', true)}
          className="demo-btn doorbell-btn"
        >
          🚪 Trigger Doorbell
        </button>
        <button 
          onClick={() => onTriggerAlert('smoke', true)}
          className="demo-btn smoke-btn"
        >
          🔥 Trigger Smoke Sensor
        </button>
      </div>
      <p className="demo-note">Use these buttons to test alerts when API is not connected</p>
    </div>
  );
};

export default DemoControls;



