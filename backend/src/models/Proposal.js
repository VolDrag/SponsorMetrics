const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: false,
    },
    rawBulletPoints: {
      type: String,
      default: '',
    },
    aiGeneratedText: {
      type: String,
      default: '',
    },
    strengthScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    strengthTips: {
      type: [String],
      default: [],
    },
    analyzedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

proposalSchema.index({ eventId: 1 });

module.exports = mongoose.model('Proposal', proposalSchema);
