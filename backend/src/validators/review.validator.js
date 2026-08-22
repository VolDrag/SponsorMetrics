const { body, param } = require('express-validator');

// ===== MODULE 3 FEATURE 1: Mutual Review & Rating System — START =====
exports.createReviewValidation = [
  body('proposalId')
    .notEmpty()
    .withMessage('Proposal is required')
    .isMongoId()
    .withMessage('Invalid proposal ID'),

  body('reliabilityScore')
    .notEmpty()
    .withMessage('Reliability score is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Reliability must be a whole number from 1 to 5'),

  body('communicationScore')
    .notEmpty()
    .withMessage('Communication score is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication must be a whole number from 1 to 5'),

  body('comment')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Comment cannot exceed 2000 characters'),
];

exports.userIdParamValidation = [
  param('userId').isMongoId().withMessage('Invalid user ID'),
];
// ===== MODULE 3 FEATURE 1: Mutual Review & Rating System — END =====
