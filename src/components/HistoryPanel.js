import React from 'react';
import './HistoryPanel.css';

const HistoryPanel = ({ history, clearHistory }) => {
  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString()
    };
  };

  const getIcon = (type) => {
    return type === 'doorbell' ? '🚪' : '🔥';
  };

  const getTypeLabel = (type) => {
    return type === 'doorbell' ? 'Doorbell' : 'Smoke Sensor';
  };

  return (
    <div className="history-panel">
      <div className="history-header">
        <h2>📋 Event History</h2>
        {history.length > 0 && (
          <button onClick={clearHistory} className="clear-btn">
            Clear History
          </button>
        )}
      </div>

      <div className="history-content">
        {history.length === 0 ? (
          <div className="empty-history">
            <p>No events recorded yet</p>
            <p className="empty-subtitle">Events will appear here when sensors are triggered</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((entry) => {
              const { date, time } = formatDateTime(entry.timestamp);
              return (
                <div key={entry.id} className="history-item">
                  <div className="history-icon">{getIcon(entry.type)}</div>
                  <div className="history-details">
                    <div className="history-message">{entry.message}</div>
                    <div className="history-meta">
                      <span className="history-type">{getTypeLabel(entry.type)}</span>
                      <span className="history-separator">•</span>
                      <span className="history-date">{date}</span>
                      <span className="history-separator">•</span>
                      <span className="history-time">{time}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPanel;


