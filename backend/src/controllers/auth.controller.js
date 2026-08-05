const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { sendOTPEmail } = require('../services/email.service');

const OTP_VALIDITY_MS = 10 * 60 * 1000;
const TOKEN_EXPIRES_IN = '7d';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

const signToken = (user) =>
  jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: TOKEN_EXPIRES_IN }
  );

const setAuthCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
  });
};

const register = async (req, res) => {
  try {
    const { name, email, password, role, organizationName } = req.body;
    const normalizedEmail = String(email).toLowerCase();

    if (role === 'admin') {
      return res.status(400).json({ message: 'Admin registration is not allowed.' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + OTP_VALIDITY_MS);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      isVerified: false,
      otp,
      otpExpiry,
      organizationName: organizationName ? String(organizationName).trim() : undefined,
    });

    await sendOTPEmail(user.email, otp);

    return res.status(201).json({
      message: 'Registration successful. Verify OTP sent to email.',
      email: user.email,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to register user.', error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const normalizedEmail = String(email).toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
      otp: String(otp),
      otpExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP.' });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const token = signToken(user);
    setAuthCookie(res, token);

    const safeUser = await User.findById(user._id).select('-password');

    return res.status(200).json({
      message: 'OTP verified successfully.',
      token,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to verify OTP.', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email).toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Account is not verified. Please verify OTP first.' });
    }

    const token = signToken(user);
    setAuthCookie(res, token);

    const safeUser = await User.findById(user._id).select('-password');

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: safeUser,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to login.', error: error.message });
  }
};

const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = String(email).toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified.' });
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + OTP_VALIDITY_MS);
    await user.save();

    await sendOTPEmail(user.email, otp);

    return res.status(200).json({ message: 'OTP resent successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to resend OTP.', error: error.message });
  }
};

const logout = async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return res.status(200).json({ message: 'Logged out successfully.' });
};

const getMe = async (req, res) => res.status(200).json({ user: req.user });

module.exports = {
  register,
  verifyOTP,
  login,
  resendOTP,
  logout,
  getMe,
};
