const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimit');
const {
  registerValidation,
  loginValidation,
  verifyOTPValidation,
  resendOTPValidation,
} = require('../validators/auth.validator');
const { validate } = require('../middleware/validate');

// ===== MODULE 9 FEATURE 1 + 2: cookie sessions + auth rate limit — START =====
router.post('/register', authLimiter, registerValidation, validate, authController.register);
router.post('/verify-otp', authLimiter, verifyOTPValidation, validate, authController.verifyOTP);
router.post('/resend-otp', authLimiter, resendOTPValidation, validate, authController.resendOTP);
router.post('/login', authLimiter, loginValidation, validate, authController.login);
router.post('/refresh', authLimiter, authController.refresh);
router.post('/logout', authController.logout);
// ===== MODULE 9 FEATURE 1 + 2 — END =====

router.get('/me', authenticate, authController.getMe);

module.exports = router;
