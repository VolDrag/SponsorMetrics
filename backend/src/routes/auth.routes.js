const express = require('express');

const auth = require('../middleware/auth');
const {
  register,
  verifyOTP,
  login,
  resendOTP,
  logout,
  getMe,
} = require('../controllers/auth.controller');
const {
  validateRegister,
  validateLogin,
  validateVerifyOTP,
  validateResendOTP,
} = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/verify-otp', validateVerifyOTP, verifyOTP);
router.post('/login', validateLogin, login);
router.post('/resend-otp', validateResendOTP, resendOTP);
router.post('/logout', auth, logout);
router.get('/me', auth, getMe);

module.exports = router;
