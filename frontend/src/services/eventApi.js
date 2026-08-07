import api from './api';

const eventApi = {
  // Create new event
  createEvent: (eventData) => api.post('/events', eventData),

  // Get all my events (organizer)
  getMyEvents: () => api.get('/events/my-events'),

  // Get single event
  getEvent: (eventId) => api.get(`/events/${eventId}`),

  // Update event
  updateEvent: (eventId, eventData) => api.put(`/events/${eventId}`, eventData),

  // Delete event (draft only)
  deleteEvent: (eventId) => api.delete(`/events/${eventId}`),

  // Publish event
  publishEvent: (eventId) => api.patch(`/events/${eventId}/publish`),

  // Discover events (sponsor)
  discoverEvents: (params) => api.get('/events/discover', { params }),
};

export default eventApi;