const crypto = require('crypto');
const User = require('../models/User');
const { sendOTP, sendWelcomeEmail } = require('../services/email.service');
const {
  issueSession,
  rotateRefresh,
  revokeRefresh,
  clearAuthCookies,
  publicUser,
} = require('../utils/session');

const otpEnabled = () => Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const makeOtp = () => String(crypto.randomInt(100000, 999999));

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, organizationName, organizationType, industry, budgetTier, phone, website } = req.body;
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    const isAdminSeed = process.env.ADMIN_EMAIL && email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase();
    const verifyNow = isAdminSeed || !otpEnabled();
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: isAdminSeed ? 'admin' : role,
      organizationName,
      organizationType,
      industry,
      budgetTier,
      phone,
      website,
      isVerified: verifyNow,
    });

    if (!verifyNow) {
      const code = makeOtp();
      user.verificationOTP = { code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
      await user.save({ validateBeforeSave: false });
      try {
        await sendOTP(user.email, code, user.name);
      } catch (mailError) {
        console.warn('[otp] email failed, code:', code, mailError.message);
      }
      return res.status(201).json({
        success: true,
        message: 'Check your email for a 6-digit verification code.',
        data: { requiresVerification: true, email: user.email },
      });
    }

    const session = await issueSession(user, res);
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: session,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+refreshTokens');
    if (!user) return res.status(400).json({ success: false, message: 'No account for that email' });
    if (user.isVerified) {
      const session = await issueSession(user, res);
      return res.json({ success: true, message: 'Already verified', data: session });
    }
    const record = user.verificationOTP || {};
    if (!record.code || String(record.code) !== String(otp)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }
    if (record.expiresAt && record.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'OTP expired' });
    }
    user.isVerified = true;
    user.verificationOTP = undefined;
    await user.save({ validateBeforeSave: false });
    sendWelcomeEmail(user.email, user.name).catch(() => {});
    const session = await issueSession(user, res);
    res.json({ success: true, message: 'OTP verified successfully', data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'OTP verification failed', error: error.message });
  }
};

exports.resendOTP = async (req, res) => {
  try {
    const user = await User.findOne({ email: String(req.body.email).toLowerCase() });
    if (!user) return res.status(200).json({ success: true, message: 'If the account exists, a code was sent' });
    const code = makeOtp();
    user.verificationOTP = { code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
    await user.save({ validateBeforeSave: false });
    try {
      await sendOTP(user.email, code, user.name);
    } catch (mailError) {
      console.warn('[otp] resend failed, code:', code, mailError.message);
    }
    res.status(200).json({ success: true, message: 'OTP resent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to resend OTP', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshTokens');

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Verify your email before logging in.',
        data: { requiresVerification: true, email: user.email },
      });
    }
    const session = await issueSession(user, res);
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: session,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const session = await rotateRefresh(req, res);
    if (!session) {
      clearAuthCookies(res);
      return res.status(401).json({ success: false, message: 'Refresh token missing or expired' });
    }
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    clearAuthCookies(res);
    res.status(401).json({ success: false, message: 'Could not refresh session' });
  }
};

exports.logout = async (req, res) => {
  try {
    await revokeRefresh(req);
    clearAuthCookies(res);
    res.status(200).json({ success: true, message: 'Logged out' });
  } catch (error) {
    clearAuthCookies(res);
    res.status(200).json({ success: true, message: 'Logged out' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: publicUser(user) });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get user data', error: error.message });
  }
};
