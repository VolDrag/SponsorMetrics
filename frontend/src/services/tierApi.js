// ifty
import api from './api';

export const benefitPresets = [
  { label: 'Logo on Main Banner', detail: 'Logo placement on the main stage/event banner' },
  { label: 'Speaking Slot', detail: '10-minute speaking slot during the event program' },
  { label: 'Facebook Posts', detail: '5 dedicated Facebook posts' },
  { label: 'Booth Space', detail: 'Dedicated booth space at the event venue' },
  { label: 'Banner Placement', detail: 'Banner placement in high-traffic venue areas' },
  { label: 'Email Mention', detail: 'Sponsor mention in organizer email campaigns' },
];

const getOrganizerEvents = async () => {
  const response = await api.get('/tiers/events/mine');
  return response.data;
};

const getTiersByEvent = async (eventId) => {
  const response = await api.get(`/tiers/event/${eventId}`);
  return response.data;
};

const createTier = async (payload) => {
  const response = await api.post('/tiers', payload);
  return response.data;
};

const updateTier = async (tierId, payload) => {
  const response = await api.put(`/tiers/${tierId}`, payload);
  return response.data;
};

const deleteTier = async (tierId) => {
  const response = await api.delete(`/tiers/${tierId}`);
  return response.data;
};

const tierApi = {
  getOrganizerEvents,
  getTiersByEvent,
  createTier,
  updateTier,
  deleteTier,
};

export default tierApi;
// ifty end