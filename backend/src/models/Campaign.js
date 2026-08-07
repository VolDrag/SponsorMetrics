const mongoose = require('mongoose');

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
  },
  {
    timestamps: true,
    collection: 'campaigns',
  }
);

const Campaign = mongoose.model('Campaign', campaignSchema);

module.exports = Campaign;
