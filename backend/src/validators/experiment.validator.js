const { body, param } = require('express-validator');

// ===== MODULE 3 FEATURE 4: A/B Experiment Tracker for Sponsorship Formats — START =====
const metricValues = ['costPerReach', 'costPerEngagement', 'audienceGrowth', 'engagementRate'];
const formatValues = ['banner', 'booth', 'speaking_slot', 'social_post', 'other'];

exports.createExperimentValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Experiment name is required')
    .isLength({ max: 200 }),

  body('primaryMetric')
    .isIn(metricValues)
    .withMessage('Primary metric is invalid'),

  body('variants')
    .isArray({ min: 2 })
    .withMessage('Add at least two variants to compare'),

  body('variants.*.label').trim().notEmpty().withMessage('Each variant needs a label'),
  body('variants.*.formatType').isIn(formatValues).withMessage('Invalid format type'),
  body('variants.*.taggedEventIds').optional().isArray(),
  body('variants.*.taggedEventIds.*').optional().isMongoId(),
  body('variants.*.isControl').optional().isBoolean(),
];

exports.experimentIdValidation = [
  param('experimentId').isMongoId().withMessage('Invalid experiment ID'),
];
// ===== MODULE 3 FEATURE 4: A/B Experiment Tracker for Sponsorship Formats — END =====
