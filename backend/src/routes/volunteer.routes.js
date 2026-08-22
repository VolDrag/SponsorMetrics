const express = require('express');
const router = express.Router();
const volunteerController = require('../controllers/volunteer.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');
const {
  eventIdParamValidation,
  volunteerIdParamValidation,
  createVolunteerValidation,
  updateVolunteerValidation,
  emailVolunteersValidation,
} = require('../validators/volunteer.validator');

// ===== MODULE 4 FEATURE 1: Volunteer Management System — START =====
router.get(
  '/signup/:eventId',
  eventIdParamValidation,
  validate,
  volunteerController.publicEventInfo
);

router.post(
  '/signup/:eventId',
  createVolunteerValidation,
  validate,
  volunteerController.publicSignup
);

router.get(
  '/event/:eventId',
  authenticate,
  requireRole('organizer'),
  eventIdParamValidation,
  validate,
  volunteerController.listVolunteers
);

router.post(
  '/event/:eventId',
  authenticate,
  requireRole('organizer'),
  createVolunteerValidation,
  validate,
  volunteerController.createVolunteer
);

router.post(
  '/event/:eventId/email',
  authenticate,
  requireRole('organizer'),
  emailVolunteersValidation,
  validate,
  volunteerController.emailVolunteers
);

router.put(
  '/:volunteerId',
  authenticate,
  requireRole('organizer'),
  updateVolunteerValidation,
  validate,
  volunteerController.updateVolunteer
);

router.patch(
  '/:volunteerId/check-in',
  authenticate,
  requireRole('organizer'),
  volunteerIdParamValidation,
  validate,
  volunteerController.toggleCheckIn
);

router.delete(
  '/:volunteerId',
  authenticate,
  requireRole('organizer'),
  volunteerIdParamValidation,
  validate,
  volunteerController.deleteVolunteer
);
// ===== MODULE 4 FEATURE 1: Volunteer Management System — END =====

module.exports = router;
