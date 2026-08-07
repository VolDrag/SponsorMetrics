const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
);

const budgetPlanSchema = new mongoose.Schema(
  {
    sponsorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    period: {
      type: String,
      required: true,
      trim: true,
    },
    totalBudget: {
      type: Number,
      required: true,
      min: 0,
    },
    spentSoFar: {
      type: Number,
      default: 0,
      min: 0,
    },
    projectedSpend: {
      type: Number,
      default: 0,
      min: 0,
    },
    overspendThresholdPercent: {
      type: Number,
      default: 10,
      min: 0,
    },
    alertsSent: {
      type: [alertSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'budgetplans',
  }
);

const BudgetPlan = mongoose.model('BudgetPlan', budgetPlanSchema);

module.exports = BudgetPlan;
