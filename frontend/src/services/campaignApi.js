import api from './api';

// MODULE 2 | Feature 3: Sponsor Portfolio Handler
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SERVER_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

// MODULE 2 | Feature 3 Event Editing — turn stored /uploads paths into full URLs
export const resolveUploadUrl = (photoPath) => {
  if (!photoPath) return '';
  if (/^https?:\/\//i.test(photoPath)) return photoPath;
  return `${SERVER_ORIGIN}${photoPath.startsWith('/') ? '' : '/'}${photoPath}`;
};

const campaignApi = {
  getMyPortfolio: () => api.get('/campaigns/my-portfolio'),
  getCampaign: (campaignId) => api.get(`/campaigns/${campaignId}`),
  updateCampaign: (campaignId, payload) => api.put(`/campaigns/${campaignId}`, payload),
  // MODULE 2 | Feature 3 Event Editing
  updateEventReport: (campaignId, formData) =>
    api.put(`/campaigns/${campaignId}/event-report`, formData),
};

export default campaignApi;
