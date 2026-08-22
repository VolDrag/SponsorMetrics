const { body, param } = require('express-validator');

// ===== MODULE 4 FEATURE 1: Volunteer Management System — START =====
exports.eventIdParamValidation = [
  param('eventId').isMongoId().withMessage('Invalid event ID'),
];

exports.volunteerIdParamValidation = [
  param('volunteerId').isMongoId().withMessage('Invalid volunteer ID'),
];

exports.createVolunteerValidation = [
  param('eventId').isMongoId().withMessage('Invalid event ID'),
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().trim().isLength({ max: 30 }),
  body('role').optional().trim().isLength({ max: 80 }),
  body('shiftTime').optional().trim().isLength({ max: 80 }),
  body('notes').optional().trim().isLength({ max: 1000 }),
];

exports.updateVolunteerValidation = [
  param('volunteerId').isMongoId().withMessage('Invalid volunteer ID'),
  body('name').optional().trim().notEmpty().isLength({ max: 100 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim().isLength({ max: 30 }),
  body('role').optional().trim().isLength({ max: 80 }),
  body('shiftTime').optional().trim().isLength({ max: 80 }),
  body('notes').optional().trim().isLength({ max: 1000 }),
  body('checkedIn').optional().isBoolean(),
];

exports.emailVolunteersValidation = [
  param('eventId').isMongoId().withMessage('Invalid event ID'),
  body('subject').trim().notEmpty().withMessage('Subject is required').isLength({ max: 200 }),
  body('body').trim().notEmpty().withMessage('Email body is required').isLength({ max: 8000 }),
  body('role').optional().trim().isLength({ max: 80 }),
  body('volunteerIds').optional().isArray(),
  body('volunteerIds.*').optional().isMongoId(),
];
// ===== MODULE 4 FEATURE 1: Volunteer Management System — END =====
