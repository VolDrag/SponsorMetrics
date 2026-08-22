const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');
const { param, body } = require('express-validator');
const { uploadReportPhotos } = require('../middleware/upload');

// ===== MODULE 4 FEATURE 2: Post-Event Report & Approval Workflow — START =====
const proposalIdValidation = [param('proposalId').isMongoId().withMessage('Invalid proposal ID')];

router.get(
  '/inbox',
  authenticate,
  requireRole('sponsor'),
  reportController.listSponsorReports
);

router.get(
  '/:proposalId',
  authenticate,
  proposalIdValidation,
  validate,
  reportController.getReport
);

router.put(
  '/:proposalId',
  authenticate,
  requireRole('organizer'),
  uploadReportPhotos,
  proposalIdValidation,
  validate,
  reportController.saveReport
);

router.post(
  '/:proposalId/submit',
  authenticate,
  requireRole('organizer'),
  proposalIdValidation,
  validate,
  reportController.submitReport
);

router.post(
  '/:proposalId/approve',
  authenticate,
  requireRole('sponsor'),
  proposalIdValidation,
  validate,
  reportController.approveReport
);

router.post(
  '/:proposalId/revision',
  authenticate,
  requireRole('sponsor'),
  proposalIdValidation,
  body('comment').trim().notEmpty().withMessage('A revision comment is required'),
  validate,
  reportController.requestRevision
);
// ===== MODULE 4 FEATURE 2: Post-Event Report & Approval Workflow — END =====

module.exports = router;
