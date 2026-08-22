const express = require('express');
const router = express.Router();
const marketingController = require('../controllers/marketing.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');
const { param } = require('express-validator');

// ===== MODULE 4 FEATURE 4: AI-Powered Marketing Consultation — START =====
router.post(
  '/events/:eventId',
  authenticate,
  requireRole('organizer'),
  param('eventId').isMongoId().withMessage('Invalid event ID'),
  validate,
  marketingController.getEventAdvice
);
// ===== MODULE 4 FEATURE 4: AI-Powered Marketing Consultation — END =====

module.exports = router;
