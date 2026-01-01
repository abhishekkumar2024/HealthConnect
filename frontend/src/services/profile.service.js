import api from './api.js';

export const profileService = {
  getProfile: async (username) => {
    const response = await api.get(`/profile/${username}`);
    return response.data;
  },

  updateProfile: async (username, profileData) => {
    const formData = new FormData();
    
    Object.keys(profileData).forEach((key) => {
      if (key === 'profilePicture' && profileData[key] instanceof File) {
        formData.append('profilePicture', profileData[key]);
      } else if (key.startsWith('address[')) {
        // Handle nested address fields: address[street], address[city], etc.
        // Express will parse these into req.body.address.street, etc.
        formData.append(key, profileData[key] || '');
      } else if (profileData[key] !== null && profileData[key] !== undefined) {
        // Append all non-null values (including empty strings for address fields)
        // Don't skip empty strings as they might be needed to clear fields
        if (profileData[key] !== '') {
          formData.append(key, profileData[key]);
        } else if (key.startsWith('address[')) {
          // Still append empty address fields
          formData.append(key, '');
        }
      }
    });

    const response = await api.put(`/profile/${username}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

