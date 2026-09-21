import api from './api';
import { uploadsOrigin } from './apiConfig';

export const SERVER_ORIGIN = uploadsOrigin();

// MODULE 2 | Feature 3 Event Editing — turn stored /uploads paths into full URLs
export const resolveUploadUrl = (photoPath) => {
  if (!photoPath) return '';
  if (/^https?:\/\//i.test(photoPath)) return photoPath;
  const origin = uploadsOrigin();
  return `${origin}${photoPath.startsWith('/') ? '' : '/'}${photoPath}`;
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
