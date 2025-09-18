import axios from 'axios';

// Create axios instance with base configuration
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://munchbox-cugmarh6fcamdpd4.canadacentral-01.azurewebsites.net/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common HTTP errors
    if (error.response?.status === 401) {
      // Unauthorized - clear auth and redirect to login
      localStorage.removeItem('authToken');
      localStorage.removeItem('isLoggedIn');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
