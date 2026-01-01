import api from './api.js';

export const searchService = {
  search: async (query, filters = {}) => {
    const params = { q: query, ...filters };
    const response = await api.get('/search', { params });
    return response.data;
  },
};

