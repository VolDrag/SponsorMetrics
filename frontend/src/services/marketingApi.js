import api from './api';

// ===== MODULE 4 FEATURE 4: AI-Powered Marketing Consultation — START =====
const marketingApi = {
  getEventAdvice: (eventId) => api.post(`/marketing/events/${eventId}`),
};

export default marketingApi;
// ===== MODULE 4 FEATURE 4: AI-Powered Marketing Consultation — END =====
