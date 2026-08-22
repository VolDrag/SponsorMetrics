const mongoose = require('mongoose');

// ===== MODULE 3 FEATURE 3: Budget Pacing & Overspend Alert System — START =====
const budgetSchema = new mongoose.Schema(
  {
    sponsorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    periodType: {
      type: String,
      enum: ['quarterly', 'annual'],
      required: true,
    },
    periodStart: {
      type: Date,
      required: true,
    },
    periodEnd: {
      type: Date,
      required: true,
    },
    budgetAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    lastAlertSentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'budgets',
  }
);

budgetSchema.index({ sponsorId: 1, periodType: 1, periodStart: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
// ===== MODULE 3 FEATURE 3: Budget Pacing & Overspend Alert System — END =====
