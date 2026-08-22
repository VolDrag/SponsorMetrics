import api from './api';

// ===== MODULE 4 FEATURE 1: Volunteer Management System — START =====
const volunteerApi = {
  list: (eventId) => api.get(`/volunteers/event/${eventId}`),
  create: (eventId, payload) => api.post(`/volunteers/event/${eventId}`, payload),
  update: (volunteerId, payload) => api.put(`/volunteers/${volunteerId}`, payload),
  toggleCheckIn: (volunteerId, checkedIn) =>
    api.patch(`/volunteers/${volunteerId}/check-in`, { checkedIn }),
  remove: (volunteerId) => api.delete(`/volunteers/${volunteerId}`),
  email: (eventId, payload) => api.post(`/volunteers/event/${eventId}/email`, payload),
  publicEvent: (eventId) => api.get(`/volunteers/signup/${eventId}`),
  publicSignup: (eventId, payload) => api.post(`/volunteers/signup/${eventId}`, payload),
};

export default volunteerApi;
// ===== MODULE 4 FEATURE 1: Volunteer Management System — END =====
