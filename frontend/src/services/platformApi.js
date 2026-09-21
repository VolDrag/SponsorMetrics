import api from './api';

export const paymentApi = {
  list: () => api.get('/payments'),
  get: (id) => api.get(`/payments/${id}`),
  checkout: (id) => api.post(`/payments/${id}/checkout`),
  confirmCallback: (paymentID, status) => api.post('/payments/callback', { paymentID, status }),
  refund: (id, reason) => api.post(`/payments/${id}/refund`, { reason }),
};

export const contractApi = {
  list: () => api.get('/contracts'),
  get: (id) => api.get(`/contracts/${id}`),
  sign: (id, fullName) => api.post(`/contracts/${id}/sign`, { fullName }),
};

export const notificationApi = {
  list: () => api.get('/notifications'),
  markRead: (id) => api.post('/notifications/read', id ? { id } : {}),
};

export const adminApi = {
  dashboard: () => api.get('/admin/dashboard'),
  kyc: (status = 'pending') => api.get(`/admin/kyc?status=${status}`),
  reviewKyc: (id, decision, reason) => api.post(`/admin/kyc/${id}`, { decision, reason }),
  flaggedProposals: () => api.get('/admin/flagged-proposals'),
  flaggedPhotos: () => api.get('/admin/flagged-photos'),
  release: (paymentId) => api.post(`/admin/payments/${paymentId}/release`),
  refund: (paymentId, reason) => api.post(`/admin/payments/${paymentId}/refund`, { reason }),
};

export const disputeApi = {
  list: () => api.get('/disputes'),
  create: (payload) => api.post('/disputes', payload),
  comment: (id, message) => api.post(`/disputes/${id}/comment`, { message }),
  resolve: (id, action, notes) => api.post(`/disputes/${id}/resolve`, { action, notes }),
};

export const teamApi = {
  list: () => api.get('/team'),
  invite: (payload) => api.post('/team/invite', payload),
  revoke: (id) => api.post(`/team/${id}/revoke`),
  activity: () => api.get('/team/activity'),
};

export const verificationApi = {
  mine: () => api.get('/verification'),
  submit: (formData) => api.post('/verification', formData),
};
