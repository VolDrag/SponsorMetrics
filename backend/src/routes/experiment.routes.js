const express = require('express');
const router = express.Router();
const experimentController = require('../controllers/experiment.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');
const {
  createExperimentValidation,
  experimentIdValidation,
} = require('../validators/experiment.validator');

// ===== MODULE 3 FEATURE 4: A/B Experiment Tracker for Sponsorship Formats — START =====
router.get(
  '/events',
  authenticate,
  requireRole('sponsor'),
  experimentController.listTaggableEvents
);

router.get(
  '/',
  authenticate,
  requireRole('sponsor'),
  experimentController.listExperiments
);

router.post(
  '/',
  authenticate,
  requireRole('sponsor'),
  createExperimentValidation,
  validate,
  experimentController.createExperiment
);

router.get(
  '/:experimentId',
  authenticate,
  requireRole('sponsor'),
  experimentIdValidation,
  validate,
  experimentController.getExperiment
);
// ===== MODULE 3 FEATURE 4: A/B Experiment Tracker for Sponsorship Formats — END =====

module.exports = router;
