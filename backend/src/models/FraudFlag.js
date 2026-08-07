const mongoose = require('mongoose');

const fraudFlagSchema = new mongoose.Schema(
  {
    targetType: {
      type: String,
      enum: ['user', 'proposal'],
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    flagReason: {
      type: String,
      trim: true,
      required: true,
    },
    aiConfidenceScore: {
      type: Number,
      min: 0,
      max: 1,
    },
    reviewedByAdmin: {
      type: Boolean,
      default: false,
    },
    adminDecision: {
      type: String,
      enum: ['dismissed', 'confirmed'],
    },
  },
  {
    timestamps: true,
    collection: 'fraudflags',
  }
);

const FraudFlag = mongoose.model('FraudFlag', fraudFlagSchema);

module.exports = FraudFlag;
