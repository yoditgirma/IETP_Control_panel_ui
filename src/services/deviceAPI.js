import axios from 'axios';

const BASE_URL = 'http://localhost:3001/api';

export const deviceAPI = {
  async getStatus() {
    try {
      const response = await axios.get(`${BASE_URL}/status`, {
        timeout: 3000, // Shorter timeout for faster response
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Handle different response formats
      const data = response.data;
      
      return {
        doorbell: data.doorbell || data.doorbell === 1 ? 1 : 0,
        smoke: data.smoke || data.smoke === 1 ? 1 : 0,
        smokeValue: data.smokeValue || 0,
        connected: data.connected !== false,
        timestamp: data.timestamp
      };
    } catch (error) {
      console.error('Device API error:', error.message);
      
      // Return null to trigger demo mode
      return null;
    }
  },
  
  async triggerTest(type) {
    try {
      const endpoint = type === 'doorbell' ? '/trigger/doorbell' : '/trigger/smoke';
      await axios.post(`${BASE_URL}${endpoint}`);
      return true;
    } catch (error) {
      console.error('Test trigger failed:', error);
      return false;
    }
  }
};