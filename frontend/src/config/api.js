// Use relative URL to work with Vite proxy in development
// In production, use full URL from environment variable
const API_BASE_URL = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1')
  : '/api/v1';

export default API_BASE_URL;

