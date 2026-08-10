const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.post('/', authenticate, requireRole('organizer'), eventController.createEvent);
router.get('/my-events', authenticate, requireRole('organizer'), eventController.getMyEvents);
router.get('/:eventId', authenticate, eventController.getEventById);
router.put('/:eventId', authenticate, requireRole('organizer'), eventController.updateEvent);
router.delete('/:eventId', authenticate, requireRole('organizer'), eventController.deleteEvent);
router.patch('/:eventId/publish', authenticate, requireRole('organizer'), eventController.publishEvent);
router.get('/discover', authenticate, requireRole('sponsor'), eventController.getPublishedEvents);

module.exports = router;
