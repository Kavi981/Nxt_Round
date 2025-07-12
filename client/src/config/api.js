// Configure axios defaults
import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://nxt-round.onrender.com';

// Set base URL for all API calls
axios.defaults.baseURL = API_BASE_URL;

// Configure axios to include credentials for session-based authentication
axios.defaults.withCredentials = true;

// Add request interceptor to handle errors
axios.interceptors.request.use(
  (config) => {
    // Add any request headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.log('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

export default axios; 