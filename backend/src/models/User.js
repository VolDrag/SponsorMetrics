const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: ['organizer', 'sponsor', 'admin'],
      required: true,
    },
    // Organizer-specific fields
    organizationName: {
      type: String,
      trim: true,
    },
    organizationType: {
      type: String,
      enum: ['university_club', 'ngo', 'startup', 'other'],
    },
    industry: {
      type: String,
      trim: true,
    },
    budgetTier: {
      type: String,
      enum: ['starter', 'growth', 'pro', 'small', 'medium', 'large', 'enterprise'],
    },
    credibilityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    // ===== MODULE 3 FEATURE 1: Mutual Review & Rating System — START =====
    avgReliability: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    avgCommunication: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // ===== MODULE 3 FEATURE 1: Mutual Review & Rating System — END =====
    phone: {
      type: String,
      trim: true,
    },
    // ===== MODULE 4 FEATURE 3: AI Fraud & Spam Detection — START =====
    website: {
      type: String,
      trim: true,
      default: '',
    },
    // ===== MODULE 4 FEATURE 3: AI Fraud & Spam Detection — END =====
    isVerified: {
      type: Boolean,
      default: true,
    },
    verificationOTP: {
      code: String,
      expiresAt: Date,
    },
    profilePicture: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);