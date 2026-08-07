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
    passwordHash: {
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
<<<<<<< HEAD
=======
    organizationType: {
      type: String,
      enum: ['university_club', 'ngo', 'startup', 'other'],
    },
    // Sponsor-specific fields
>>>>>>> 39bb17d90599a739c5041e532ad6f933f7b961a3
    industry: {
      type: String,
      trim: true,
    },
    budgetTier: {
      type: String,
<<<<<<< HEAD
      enum: ['starter', 'growth', 'pro'],
    },
    credibilityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
=======
      enum: ['small', 'medium', 'large', 'enterprise'],
    },
    // Common fields
    phone: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
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
>>>>>>> 39bb17d90599a739c5041e532ad6f933f7b961a3
    },
  },
  { timestamps: true }
);

<<<<<<< HEAD
userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }

  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  return next();
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
=======
// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
>>>>>>> 39bb17d90599a739c5041e532ad6f933f7b961a3
};

module.exports = mongoose.model('User', userSchema);