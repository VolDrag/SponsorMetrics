import api from './api';

// MODULE 2 | Feature 1, 2, and 4 — frontend API helpers for proposals
const proposalApi = {
  // ========== MODULE 2 | Feature 1: Proposal Creator — START ==========
  createProposal: (proposalData) => api.post('/proposals', proposalData),

  getMyProposals: () => api.get('/proposals/my-proposals'),

  getSponsors: () => api.get('/proposals/sponsors'),

  getProposal: (proposalId) => api.get(`/proposals/${proposalId}`), // also Feature 2 review page

  updateProposal: (proposalId, proposalData) =>
    api.put(`/proposals/${proposalId}`, proposalData),

  sendProposal: (proposalId, payload = {}) =>
    api.post(`/proposals/${proposalId}/send`, payload),

  aiAssist: (payload) => api.post('/proposals/ai-assist', payload),
  // ========== MODULE 2 | Feature 1: Proposal Creator — END ==========

  // ========== MODULE 2 | Feature 2: Proposal Review & In-Platform Negotiation — START ==========
  getInbox: () => api.get('/proposals/inbox'),

  counterOffer: (proposalId, payload) =>
    api.post(`/proposals/${proposalId}/counter-offer`, payload),

  acceptProposal: (proposalId) => api.post(`/proposals/${proposalId}/accept`),

  rejectProposal: (proposalId) => api.post(`/proposals/${proposalId}/reject`),
  // ========== MODULE 2 | Feature 2: Proposal Review & In-Platform Negotiation — END ==========

  // MODULE 2 | Feature 4: Proposal Status Tracker
  getPipeline: () => api.get('/proposals/pipeline'),
};

export default proposalApi;
