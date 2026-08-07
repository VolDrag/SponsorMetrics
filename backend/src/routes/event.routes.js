const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const {
  createEventValidation,
  updateEventValidation,
  eventIdValidation,
} = require('../validators/event.validator');
const { validate } = require('../middleware/validate'); // If you have this, otherwise use your existing validation pattern

// Organizer routes
router.post(
  '/',
  authenticate,
  requireRole('organizer'),
  createEventValidation,
  validate, // or however you handle validation errors
  eventController.createEvent
);

router.get(
  '/my-events',
  authenticate,
  requireRole('organizer'),
  eventController.getMyEvents
);

router.get(
  '/:eventId',
  authenticate,
  eventIdValidation,
  validate,
  eventController.getEventById
);

router.put(
  '/:eventId',
  authenticate,
  requireRole('organizer'),
  updateEventValidation,
  validate,
  eventController.updateEvent
);

router.delete(
  '/:eventId',
  authenticate,
  requireRole('organizer'),
  eventIdValidation,
  validate,
  eventController.deleteEvent
);

router.patch(
  '/:eventId/publish',
  authenticate,
  requireRole('organizer'),
  eventIdValidation,
  validate,
  eventController.publishEvent
);

// Sponsor discovery route
router.get(
  '/discover',
  authenticate,
  requireRole('sponsor'),
  eventController.getPublishedEvents
);

module.exports = router;