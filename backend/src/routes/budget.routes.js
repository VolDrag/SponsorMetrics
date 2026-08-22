const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budget.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');
const { upsertBudgetValidation } = require('../validators/budget.validator');

// ===== MODULE 3 FEATURE 3: Budget Pacing & Overspend Alert System — START =====
router.get(
  '/pacing',
  authenticate,
  requireRole('sponsor'),
  budgetController.getPacing
);

router.get(
  '/',
  authenticate,
  requireRole('sponsor'),
  budgetController.listBudgets
);

router.put(
  '/',
  authenticate,
  requireRole('sponsor'),
  upsertBudgetValidation,
  validate,
  budgetController.upsertBudget
);
// ===== MODULE 3 FEATURE 3: Budget Pacing & Overspend Alert System — END =====

module.exports = router;
