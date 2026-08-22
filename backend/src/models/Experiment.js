const mongoose = require('mongoose');

// ===== MODULE 3 FEATURE 4: A/B Experiment Tracker for Sponsorship Formats — START =====
const variantSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    formatType: {
      type: String,
      enum: ['banner', 'booth', 'speaking_slot', 'social_post', 'other'],
      required: true,
    },
    taggedEventIds: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: 'Event',
      default: [],
    },
    isControl: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const experimentSchema = new mongoose.Schema(
  {
    sponsorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, 'Experiment name cannot exceed 200 characters'],
    },
    primaryMetric: {
      type: String,
      enum: ['costPerReach', 'costPerEngagement', 'audienceGrowth', 'engagementRate'],
      required: true,
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'experiments',
  }
);

module.exports = mongoose.model('Experiment', experimentSchema);
// ===== MODULE 3 FEATURE 4: A/B Experiment Tracker for Sponsorship Formats — END =====
