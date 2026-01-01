import api from './api.js';

export const doctorService = {
  getDoctors: async (params = {}) => {
    const response = await api.get('/doctors', { params });
    // Backend returns array directly, wrap it in data for consistency
    return { data: Array.isArray(response.data) ? response.data : [] };
  },
};

