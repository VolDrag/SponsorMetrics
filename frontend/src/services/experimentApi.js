import api from './api';

// ===== MODULE 3 FEATURE 4: A/B Experiment Tracker for Sponsorship Formats — START =====
const experimentApi = {
  listEvents: () => api.get('/experiments/events'),
  listExperiments: () => api.get('/experiments'),
  createExperiment: (payload) => api.post('/experiments', payload),
  getExperiment: (experimentId) => api.get(`/experiments/${experimentId}`),
};

export default experimentApi;
// ===== MODULE 3 FEATURE 4: A/B Experiment Tracker for Sponsorship Formats — END =====
