const { body } = require('express-validator');

// ===== MODULE 3 FEATURE 3: Budget Pacing & Overspend Alert System — START =====
exports.upsertBudgetValidation = [
  body('periodType')
    .isIn(['quarterly', 'annual'])
    .withMessage('Period type must be quarterly or annual'),

  body('periodStart')
    .notEmpty()
    .withMessage('Period start is required')
    .isISO8601()
    .withMessage('Invalid period start date'),

  body('periodEnd')
    .notEmpty()
    .withMessage('Period end is required')
    .isISO8601()
    .withMessage('Invalid period end date'),

  body('budgetAmount')
    .notEmpty()
    .withMessage('Budget amount is required')
    .isFloat({ min: 0 })
    .withMessage('Budget amount must be a non-negative number'),
];
// ===== MODULE 3 FEATURE 3: Budget Pacing & Overspend Alert System — END =====
