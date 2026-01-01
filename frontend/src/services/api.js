import axios from 'axios';
import API_BASE_URL from '../config/api.js';

// Log API configuration for debugging
if (import.meta.env.DEV) {
  console.log('🔧 API Configuration:', {
    baseURL: API_BASE_URL,
    isProduction: import.meta.env.PROD,
    viteApiUrl: import.meta.env.VITE_API_URL,
  });
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token is in httpOnly cookie, backend handles it
        // Use api instance to ensure proper baseURL and configuration
        const response = await api.post(
          '/auth/refresh-token',
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        // Clear all auth data
        localStorage.removeItem('accessToken');
        // Clear any user data
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?session=expired';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other 401 errors (unauthorized)
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?session=expired';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

