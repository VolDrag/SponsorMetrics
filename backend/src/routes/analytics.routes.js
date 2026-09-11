const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');
const { aiLimiter } = require('../middleware/rateLimit');
const {
  submitMetricsValidation,
  sponsorIdParamValidation,
  eventIdParamValidation,
  askAboutRoiValidation,
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

router.post(
  '/ask',
  authenticate,
  requireRole('sponsor'),
  aiLimiter,
  askAboutRoiValidation,
  validate,
  analyticsController.askAboutRoi
);

router.get(
  '/organizer',
  authenticate,
  requireRole('organizer'),
  analyticsController.getOrganizerRoi
);

router.get(
  '/export.csv',
  authenticate,
  requireRole('sponsor'),
  analyticsController.exportSponsorCsv
);

// ===== MODULE 3 FEATURE 2: Sponsorship Performance & ROI Analytics — END =====

module.exports = router;
