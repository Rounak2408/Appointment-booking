import axios from 'axios';

/**
 * API Service
 * Configured axios instance for API calls with JWT expiry handling
 */
const fallbackBaseURL =
  typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://appointment-booking-866p.onrender.com/api'
    : 'http://localhost:5000/api';

const api = axios.create({
  // Prefer env variable, fallback avoids localhost in production
  baseURL: process.env.REACT_APP_API_URL || fallbackBaseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle JWT expiry
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      // Trigger logout event for AuthContext
      window.dispatchEvent(new Event('auth:logout'));
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
