const mongoose = require('mongoose');



const proposalSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: false, // Module 1 analyzer may omit this; Feature 1 always sets it
    },
    // ========== MODULE 2 | Feature 1: Proposal Creator — START ==========
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    sponsorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    selectedTierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SponsorshipTier',
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
    },
    goals: {
      type: String,
      default: '',
      trim: true,
      maxlength: [1000, 'Goals cannot exceed 1000 characters'],
    },
    body: {
      type: String,
      default: '',
      maxlength: [8000, 'Proposal body cannot exceed 8000 characters'],
    },
    proposedBudget: {
      type: Number,
      min: 0,
      default: 0,
    },
    // MODULE 2 | Feature 1 + Feature 4: pipeline status (Drafted → Sent → Viewed → Negotiation → Accepted/Rejected)
    status: {
      type: String,
      enum: ['drafted', 'sent', 'viewed', 'negotiation', 'accepted', 'rejected'],
      default: 'drafted',
      index: true,
    },
    sentAt: {
      type: Date,
      default: null,
    },
    // MODULE 2 | Feature 2 + Feature 4: set when the sponsor first opens a sent proposal
    viewedAt: {
      type: Date,
      default: null,
    },
    respondedAt: {
      type: Date,
      default: null,
    },
    // ========== MODULE 2 | Feature 1: Proposal Creator — END ==========
    // Module 1 analyzer fields (kept for Proposal Strength Analyzer)
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
    // MODULE 2 | Feature 2: negotiation history records
    counterOffers: {
      type: [counterOfferSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

proposalSchema.index({ eventId: 1 });
proposalSchema.index({ organizerId: 1, status: 1 });
proposalSchema.index({ sponsorId: 1, status: 1 });

module.exports = mongoose.model('Proposal', proposalSchema);
