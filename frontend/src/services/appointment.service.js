import api from './api.js';

export const appointmentService = {
  requestAppointment: async (appointmentData) => {
    const response = await api.post('/appointments/request', appointmentData);
    return response.data;
  },

  confirmBookingFee: async (appointmentId) => {
    const response = await api.post(`/appointments/${appointmentId}/confirm-booking-fee`);
    return response.data;
  },

  completePayment: async (appointmentId, paymentData) => {
    const response = await api.post(`/appointments/${appointmentId}/pay`, paymentData);
    return response.data;
  },

  doctorRespond: async (appointmentId, responseData) => {
    const response = await api.put(`/appointments/${appointmentId}/respond`, responseData);
    return response.data;
  },

  getAppointmentDetails: async (appointmentId) => {
    const response = await api.get(`/appointments/${appointmentId}`);
    return response.data;
  },

  getUserAppointments: async () => {
    const response = await api.get('/appointments');
    return response.data;
  },

  cancelAppointment: async (appointmentId, reason) => {
    const response = await api.post(`/appointments/${appointmentId}/cancel`, { reason });
    return response.data;
  },
};

