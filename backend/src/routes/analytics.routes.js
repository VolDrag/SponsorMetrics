const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');
const {
  submitMetricsValidation,
  sponsorIdParamValidation,
  eventIdParamValidation,
} = require('../validators/analytics.validator');

// ===== MODULE 3 FEATURE 2: Sponsorship Performance & ROI Analytics — START =====
router.post(
  '/metrics',
  authenticate,
  requireRole('organizer'),
  submitMetricsValidation,
  validate,
  analyticsController.submitMetrics
);

router.get(
  '/events/:eventId/metrics',
  authenticate,
  requireRole('organizer'),
  eventIdParamValidation,
  validate,
  analyticsController.getEventMetrics
);

router.get(
  '/roi/:sponsorId',
  authenticate,
  sponsorIdParamValidation,
  validate,
  analyticsController.getSponsorRoi
);
// ===== MODULE 3 FEATURE 2: Sponsorship Performance & ROI Analytics — END =====

module.exports = router;
