import api from './api';

// ===== MODULE 3 FEATURE 2: Sponsorship Performance & ROI Analytics — START =====
const analyticsApi = {
  submitMetrics: (payload) => api.post('/analytics/metrics', payload),
  getEventMetrics: (eventId) => api.get(`/analytics/events/${eventId}/metrics`),
  getSponsorRoi: (sponsorId) => api.get(`/analytics/roi/${sponsorId}`),
};

export default analyticsApi;
// ===== MODULE 3 FEATURE 2: Sponsorship Performance & ROI Analytics — END =====
