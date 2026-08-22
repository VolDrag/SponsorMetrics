const mongoose = require('mongoose');

// ========== MODULE 2 | Feature 3 Event Editing — START ==========
const eventReportSchema = new mongoose.Schema(
  {
    reach: { type: Number, default: 0, min: 0 },
    engagement: { type: Number, default: 0, min: 0 },
    leads: { type: Number, default: 0, min: 0 },
    conversions: { type: Number, default: 0, min: 0 },
    likes: { type: Number, default: 0, min: 0 },
    shares: { type: Number, default: 0, min: 0 },
    attendance: { type: Number, default: 0, min: 0 },
    audienceGrowth: { type: Number, default: 0, min: 0 },
    revenue: { type: Number, default: 0, min: 0 },
    profit: { type: Number, default: 0 },
    costPerReach: { type: Number, min: 0 },
    costPerEngagement: { type: Number, min: 0 },
    photos: { type: [String], default: [] },
    submittedAt: { type: Date, default: null },
  },
  { _id: false }
);
// ========== MODULE 2 | Feature 3 Event Editing — END ==========

const goalSchema = new mongoose.Schema(
  {
    metric: {
      type: String,
      required: true,
      trim: true,
    },
    targetValue: {
      type: Number,
      required: true,
    },
    currentValue: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const campaignSchema = new mongoose.Schema(
  {
    // MODULE 2 | Feature 3: Sponsor Portfolio Handler
    sponsorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal',
      required: true,
    },
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
    },
    spend: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['active', 'upcoming', 'completed'],
      default: 'upcoming',
    },
    healthIndicator: {
      type: String,
      enum: ['green', 'yellow', 'red'],
      default: 'green',
    },
    goals: {
      type: [goalSchema],
      default: [],
    },
    // MODULE 2 | Feature 3 Event Editing — stats, profit/revenue, photos
    eventReport: {
      type: eventReportSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
    collection: 'campaigns',
  }
);

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
