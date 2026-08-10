const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  verifyOTPValidation,
  resendOTPValidation,
} = require('../validators/auth.validator');
const { validate } = require('../middleware/validate');

// Public routes
router.post('/register', registerValidation, validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);

// Protected routes
router.get('/me', authenticate, authController.getMe);

module.exports = router;