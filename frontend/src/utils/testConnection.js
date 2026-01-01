// Utility to test backend connection
import api from '../services/api.js';

export const testConnection = async () => {
  try {
    console.log('Testing backend connection...');
    console.log('API Base URL:', import.meta.env.VITE_API_URL || '/api/v1');
    
    const response = await api.get('/health');
    console.log('✅ Backend connection successful!', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      baseURL: error.config?.baseURL,
    });
    return { 
      success: false, 
      error: error.message,
      details: error.response?.data 
    };
  }
};

// Call this in browser console: testConnection()

