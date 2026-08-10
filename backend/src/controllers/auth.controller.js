const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

exports.register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      organizationName,
      organizationType,
      industry,
      budgetTier,
      phone,
    } = req.body;

    const normalizedEmail = String(email).toLowerCase();

    if (role === 'admin') {
      return res.status(400).json({ message: 'Admin registration is not allowed.' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      role,
      organizationName,
      organizationType,
      industry,
      budgetTier,
      phone,
      isVerified: true,
    });

    const token = generateToken(user._id);
    const safeUser = await User.findById(user._id).select('-password');

    return res.status(201).json({
      success: true,
      message: 'Registration successful!',
      token,
      user: safeUser,
      data: { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: true } }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email).toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select('+password');

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
    const token = generateToken(user._id);
    const safeUser = await User.findById(user._id).select('-password');

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: safeUser,
      data: { token, user: { _id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified } }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};
 
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get user data', error: error.message });
  }
};
