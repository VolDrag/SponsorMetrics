import api from './api';

// ===== MODULE 4 FEATURE 2: Post-Event Report & Approval Workflow — START =====
const reportApi = {
  getInbox: () => api.get('/reports/inbox'),
  getReport: (proposalId) => api.get(`/reports/${proposalId}`),
  saveReport: (proposalId, formData) => api.put(`/reports/${proposalId}`, formData),
  submitReport: (proposalId) => api.post(`/reports/${proposalId}/submit`),
  approveReport: (proposalId) => api.post(`/reports/${proposalId}/approve`),
  requestRevision: (proposalId, comment) =>
    api.post(`/reports/${proposalId}/revision`, { comment }),
};

export default reportApi;
// ===== MODULE 4 FEATURE 2: Post-Event Report & Approval Workflow — END =====
