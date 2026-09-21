import api from './api';

export const paymentApi = {
  list: () => api.get('/payments'),
  get: (id) => api.get(`/payments/${id}`),
  checkout: (id) => api.post(`/payments/${id}/checkout`),
  confirmCallback: (paymentID, status) => api.post('/payments/callback', { paymentID, status }),
  refund: (id, reason) => api.post(`/payments/${id}/refund`, { reason }),
  invoice: (id) => api.get(`/payments/${id}/invoice`, { responseType: 'blob' }),
};

export const contractApi = {
  list: () => api.get('/contracts'),
  get: (id) => api.get(`/contracts/${id}`),
  sign: (id, fullName) => api.post(`/contracts/${id}/sign`, { fullName }),
  pdf: (id) => api.get(`/contracts/${id}/pdf`, { responseType: 'blob' }),
};

export const openPdf = async (request, filename = 'document.pdf') => {
  const res = await request();
  const headerType = String(res.headers?.['content-type'] || '');
  const blob = res.data instanceof Blob ? res.data : new Blob([res.data], { type: headerType || 'application/pdf' });
  const peek = await blob.slice(0, 80).text();
  const looksHtml = headerType.includes('text/html') || blob.type.includes('text/html') || /<!doctype html|<html/i.test(peek);
  const looksJson = headerType.includes('application/json') || blob.type.includes('application/json') || peek.trim().startsWith('{');
  if (looksHtml) {
    throw new Error('The PDF request hit the Vercel website instead of the API. Set VITE_API_URL to https://sponsormetrics.onrender.com/api and redeploy.');
  }
  if (looksJson) {
    let message = 'Could not open PDF';
    try {
      message = JSON.parse(await blob.text()).message || message;
    } catch (_e) {
      /* keep default */
    }
    throw new Error(message);
  }
  const file = new Blob([blob], { type: 'application/pdf' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
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
