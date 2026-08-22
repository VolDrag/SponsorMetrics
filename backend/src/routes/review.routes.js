const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const {
  createReviewValidation,
  userIdParamValidation,
} = require('../validators/review.validator');

// ===== MODULE 3 FEATURE 1: Mutual Review & Rating System — START =====
router.get('/pending', authenticate, reviewController.getPendingReviews);

router.post(
  '/',
  authenticate,
  createReviewValidation,
  validate,
  reviewController.createReview
);

router.get(
  '/user/:userId',
  authenticate,
  userIdParamValidation,
  validate,
  reviewController.getUserReviews
);
// ===== MODULE 3 FEATURE 1: Mutual Review & Rating System — END =====

module.exports = router;
