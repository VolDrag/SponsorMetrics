const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    plan: {
      type: String,
      enum: ['starter', 'growth', 'pro'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'past_due'],
      required: true,
      default: 'active',
    },
    portfolioLimit: {
      type: Number,
      min: 0,
    },
    aiGenerationLimit: {
      type: Number,
      min: 0,
    },
    bkashSubscriptionRef: {
      type: String,
      trim: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    renewsAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'subscriptions',
  }
);

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription;
