const { body, param } = require('express-validator');

// ========== MODULE 2 | Feature 3: Sponsor Portfolio Handler — START ==========
exports.campaignIdValidation = [
  param('campaignId')
    .isMongoId()
    .withMessage('Invalid campaign ID'),
];

exports.updateCampaignValidation = [
  param('campaignId')
    .isMongoId()
    .withMessage('Invalid campaign ID'),

  body('status')
    .optional()
    .isIn(['active', 'upcoming', 'completed'])
    .withMessage('Status must be active, upcoming, or completed'),

  body('spend')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Spend must be a non-negative number'),

  body('healthIndicator')
    .optional()
    .isIn(['green', 'yellow', 'red'])
    .withMessage('Health must be green, yellow, or red'),
];
// ========== MODULE 2 | Feature 3: Sponsor Portfolio Handler — END ==========

// ========== MODULE 2 | Feature 3 Event Editing — START ==========
const optionalNonNegative = (field) =>
  body(field)
    .optional({ checkFalsy: true })
    .isFloat({ min: 0 })
    .withMessage(`${field} must be a non-negative number`);

exports.updateEventReportValidation = [
  param('campaignId')
    .isMongoId()
    .withMessage('Invalid campaign ID'),

  optionalNonNegative('reach'),
  optionalNonNegative('engagement'),
  optionalNonNegative('leads'),
  optionalNonNegative('conversions'),
  optionalNonNegative('likes'),
  optionalNonNegative('shares'),
  optionalNonNegative('attendance'),
  optionalNonNegative('audienceGrowth'),
  optionalNonNegative('revenue'),

  body('profit')
    .optional({ checkFalsy: true })
    .isFloat()
    .withMessage('Profit must be a number'),
];
// ========== MODULE 2 | Feature 3 Event Editing — END ==========
