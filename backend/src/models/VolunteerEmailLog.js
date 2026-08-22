const mongoose = require('mongoose');

// ===== MODULE 4 FEATURE 1: Volunteer Management System — START =====
const volunteerEmailLogSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: String,
      required: true,
      trim: true,
    },
    recipientEmails: {
      type: [String],
      default: [],
    },
    recipientCount: {
      type: Number,
      default: 0,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'volunteeremaillogs',
  }
);

module.exports = mongoose.model('VolunteerEmailLog', volunteerEmailLogSchema);
// ===== MODULE 4 FEATURE 1: Volunteer Management System — END =====
