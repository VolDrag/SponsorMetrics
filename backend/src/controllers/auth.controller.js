const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Register new user (NO EMAIL VERIFICATION)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
<<<<<<< HEAD
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
      passwordHash: password,
=======
    const {
      name,
      email,
      password,
>>>>>>> 39bb17d90599a739c5041e532ad6f933f7b961a3
      role,
      organizationName,
      organizationType,
      industry,
      budgetTier,
      phone,
    } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create user with isVerified = true (skip verification)
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      organizationName,
      organizationType,
      industry,
      budgetTier,
      phone,
      isVerified: true,
    });

    // Generate token immediately
    const token = generateToken(user._id);

<<<<<<< HEAD
    const safeUser = await User.findById(user._id).select('-passwordHash');

    return res.status(200).json({
      message: 'OTP verified successfully.',
      token,
      user: safeUser,
=======
    res.status(201).json({
      success: true,
      message: 'Registration successful!',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        },
      },
>>>>>>> 39bb17d90599a739c5041e532ad6f933f7b961a3
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

<<<<<<< HEAD
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
=======
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

>>>>>>> 39bb17d90599a739c5041e532ad6f933f7b961a3
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated',
      });
    }

    const token = generateToken(user._id);

<<<<<<< HEAD
    const safeUser = await User.findById(user._id).select('-passwordHash');

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: safeUser,
=======
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          organizationName: user.organizationName,
          industry: user.industry,
        },
      },
>>>>>>> 39bb17d90599a739c5041e532ad6f933f7b961a3
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message,
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        organizationName: user.organizationName,
        organizationType: user.organizationType,
        industry: user.industry,
        budgetTier: user.budgetTier,
        phone: user.phone,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
      error: error.message,
    });
  }
};
