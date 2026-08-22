// ifty
const mongoose = require('mongoose');

const benefitSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    detail: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const sponsorshipTierSchema = new mongoose.Schema(
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
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    // ===== MODULE 3 FEATURE 4: A/B Experiment Tracker — START =====
    formatType: {
      type: String,
      enum: ['banner', 'booth', 'speaking_slot', 'social_post', 'other'],
      default: 'other',
    },
    // ===== MODULE 3 FEATURE 4: A/B Experiment Tracker — END =====
    benefits: {
      type: [benefitSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'sponsorshiptiers',
  }
);

const SponsorshipTier = mongoose.model('SponsorshipTier', sponsorshipTierSchema);

module.exports = SponsorshipTier;
// ifty end
