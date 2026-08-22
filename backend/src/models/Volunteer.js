const mongoose = require('mongoose');

// ===== MODULE 4 FEATURE 1: Volunteer Management System — START =====
const volunteerSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      trim: true,
      default: 'General',
      maxlength: 80,
    },
    shiftTime: {
      type: String,
      trim: true,
      default: '',
      maxlength: 80,
    },
    checkedIn: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
      maxlength: 1000,
    },
    source: {
      type: String,
      enum: ['organizer', 'self_signup'],
      default: 'organizer',
    },
  },
  {
    timestamps: true,
    collection: 'volunteers',
  }
);

volunteerSchema.index({ eventId: 1, email: 1 }, { unique: true });

module.exports = mongoose.model('Volunteer', volunteerSchema);
// ===== MODULE 4 FEATURE 1: Volunteer Management System — END =====
