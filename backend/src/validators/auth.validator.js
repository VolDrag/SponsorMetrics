const { body, param } = require('express-validator');

exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().notEmpty().isEmail().withMessage('Valid email required'),
  body('password').trim().notEmpty().isLength({ min: 6 }).withMessage('Password min 6 chars'),
  body('role').notEmpty().isIn(['organizer', 'sponsor']).withMessage('Role must be organizer or sponsor'),
];

exports.loginValidation = [
  body('email').trim().notEmpty().isEmail().withMessage('Valid email required'),
  body('password').trim().notEmpty().withMessage('Password is required'),
];

exports.verifyOTPValidation = [
  body('email').trim().notEmpty().isEmail(),
  body('otp').trim().notEmpty().isLength({ min: 6, max: 6 }).isNumeric(),
];

exports.resendOTPValidation = [
  body('email').trim().notEmpty().isEmail(),
];

exports.createEventValidation = [
  body('name').trim().notEmpty(),
  body('expectedCrowdSize').notEmpty().isInt({ min: 1 }),
  body('venue').trim().notEmpty(),
  body('location.lat').notEmpty().isFloat({ min: -90, max: 90 }),
  body('location.lng').notEmpty().isFloat({ min: -180, max: 180 }),
  body('date').notEmpty().isISO8601(),
];

exports.updateEventValidation = [
  param('eventId').isMongoId(),
  body('name').optional().trim(),
  body('expectedCrowdSize').optional().isInt({ min: 1 }),
  body('venue').optional().trim(),
  body('location.lat').optional().isFloat({ min: -90, max: 90 }),
  body('location.lng').optional().isFloat({ min: -180, max: 180 }),
  body('date').optional().isISO8601(),
  body('status').optional().isIn(['draft', 'published', 'completed']),
];

exports.eventIdValidation = [
  param('eventId').isMongoId(),
];