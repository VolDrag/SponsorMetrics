const { body, param } = require('express-validator');

// ===== MODULE 3 FEATURE 2: Sponsorship Performance & ROI Analytics — START =====
exports.submitMetricsValidation = [
  body('proposalId')
    .notEmpty()
    .withMessage('Proposal is required')
    .isMongoId()
    .withMessage('Invalid proposal ID'),

  body('totalReach')
    .notEmpty()
    .withMessage('Total reach is required')
    .isFloat({ min: 0 })
    .withMessage('Total reach must be a non-negative number'),

  body('totalEngagement')
    .notEmpty()
    .withMessage('Total engagement is required')
    .isFloat({ min: 0 })
    .withMessage('Total engagement must be a non-negative number'),

  body('attendeeCount')
    .notEmpty()
    .withMessage('Attendee count is required')
    .isFloat({ min: 0 })
    .withMessage('Attendee count must be a non-negative number'),
];

exports.sponsorIdParamValidation = [
  param('sponsorId').isMongoId().withMessage('Invalid sponsor ID'),
];

exports.eventIdParamValidation = [
  param('eventId').isMongoId().withMessage('Invalid event ID'),
];

exports.askAboutRoiValidation = [
  body('question')
    .trim()
    .notEmpty()
    .withMessage('Question is required')
    .isLength({ min: 3, max: 500 })
    .withMessage('Question must be between 3 and 500 characters'),
  body('history')
    .optional()
    .isArray({ max: 8 })
    .withMessage('History must be an array'),
  body('history.*.role')
    .optional()
    .isIn(['user', 'assistant'])
    .withMessage('History role must be user or assistant'),
  body('history.*.content')
    .optional()
    .isString()
    .isLength({ max: 2000 })
    .withMessage('History content is too long'),
];
// ===== MODULE 3 FEATURE 2: Sponsorship Performance & ROI Analytics — END =====
