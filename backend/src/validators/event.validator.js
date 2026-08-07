const { body, param } = require('express-validator');

exports.createEventValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Event name is required')
    .isLength({ max: 200 })
    .withMessage('Event name cannot exceed 200 characters'),

  body('expectedCrowdSize')
    .notEmpty()
    .withMessage('Expected crowd size is required')
    .isInt({ min: 1 })
    .withMessage('Crowd size must be a positive integer'),

  body('venue')
    .trim()
    .notEmpty()
    .withMessage('Venue is required'),

  body('location.lat')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),

  body('location.lng')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),

  body('date')
    .notEmpty()
    .withMessage('Event date is required')
    .isISO8601()
    .withMessage('Invalid date format')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),

  body('socialMediaReach')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Social media reach must be a non-negative integer'),
];

exports.updateEventValidation = [
  param('eventId')
    .isMongoId()
    .withMessage('Invalid event ID'),

  // Same as create but all fields optional
  body('name').optional().trim().isLength({ max: 200 }),
  body('expectedCrowdSize').optional().isInt({ min: 1 }),
  body('venue').optional().trim(),
  body('location.lat').optional().isFloat({ min: -90, max: 90 }),
  body('location.lng').optional().isFloat({ min: -180, max: 180 }),
  body('date').optional().isISO8601(),
  body('socialMediaReach').optional().isInt({ min: 0 }),
  body('status').optional().isIn(['draft', 'published', 'completed']),
];

exports.eventIdValidation = [
  param('eventId')
    .isMongoId()
    .withMessage('Invalid event ID'),
];