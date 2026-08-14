const express = require('express');
const router = express.Router();
const campaignController = require('../controllers/campaign.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');
const {
  campaignIdValidation,
  updateCampaignValidation,
  updateEventReportValidation, // MODULE 2 | Feature 3 Event Editing
} = require('../validators/campaign.validator');
const { uploadCampaignPhotos } = require('../middleware/upload'); // MODULE 2 | Feature 3 Event Editing

// ========== MODULE 2 | Feature 3: Sponsor Portfolio Handler — START ==========
router.get(
  '/my-portfolio',
  authenticate,
  requireRole('sponsor'),
  campaignController.getMyPortfolio
);

router.get(
  '/:campaignId',
  authenticate,
  requireRole('sponsor'),
  campaignIdValidation,
  validate,
  campaignController.getCampaignById
);

router.put(
  '/:campaignId',
  authenticate,
  requireRole('sponsor'),
  updateCampaignValidation,
  validate,
  campaignController.updateCampaign
);
// ========== MODULE 2 | Feature 3: Sponsor Portfolio Handler — END ==========

// ========== MODULE 2 | Feature 3 Event Editing: post-event report on completed cards — START ==========
router.put(
  '/:campaignId/event-report',
  authenticate,
  requireRole('sponsor'),
  uploadCampaignPhotos,
  updateEventReportValidation,
  validate,
  campaignController.updateEventReport
);
// ========== MODULE 2 | Feature 3 Event Editing — END ==========

module.exports = router;
