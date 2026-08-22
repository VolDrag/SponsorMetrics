import api from './api';

// ===== MODULE 3 FEATURE 1: Mutual Review & Rating System — START =====
const reviewApi = {
  getPending: () => api.get('/reviews/pending'),
  createReview: (payload) => api.post('/reviews', payload),
  getUserReviews: (userId) => api.get(`/reviews/user/${userId}`),
};

export default reviewApi;
// ===== MODULE 3 FEATURE 1: Mutual Review & Rating System — END =====
