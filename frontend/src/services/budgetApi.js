import api from './api';

// ===== MODULE 3 FEATURE 3: Budget Pacing & Overspend Alert System — START =====
const budgetApi = {
  getPacing: () => api.get('/budgets/pacing'),
  listBudgets: () => api.get('/budgets'),
  upsertBudget: (payload) => api.put('/budgets', payload),
};

export default budgetApi;
// ===== MODULE 3 FEATURE 3: Budget Pacing & Overspend Alert System — END =====
