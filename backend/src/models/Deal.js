const mongoose = require('mongoose');

const counterOfferSchema = new mongoose.Schema(
  {
    offeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    proposedBudget: {
      type: Number,
      min: 0,
    },
    proposedChanges: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const dealSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sponsorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SponsorshipTier',
      required: true,
    },
    status: {
      type: String,
      enum: ['drafted', 'sent', 'viewed', 'negotiation', 'accepted', 'rejected'],
      default: 'drafted',
    },
    counterOffers: {
      type: [counterOfferSchema],
      default: [],
    },
    finalAgreedBudget: {
      type: Number,
      min: 0,
    },
    finalTierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SponsorshipTier',
    },
    acceptedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'deals',
  }
);

const Deal = mongoose.model('Deal', dealSchema);

module.exports = Deal;
