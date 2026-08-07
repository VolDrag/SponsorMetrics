const mongoose = require('mongoose');

const performanceMetricSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    reach: {
      type: Number,
      default: 0,
      min: 0,
    },
    engagement: {
      type: Number,
      default: 0,
      min: 0,
    },
    audienceGrowth: {
      type: Number,
      default: 0,
      min: 0,
    },
    costPerReach: {
      type: Number,
      min: 0,
    },
    costPerEngagement: {
      type: Number,
      min: 0,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'performancemetrics',
  }
);

const PerformanceMetric = mongoose.model('PerformanceMetric', performanceMetricSchema);

module.exports = PerformanceMetric;
