const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema(
  {
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    openedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    againstUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['open', 'resolved', 'closed'],
      default: 'open',
    },
    evidence: { type: [String], default: [] },
    thread: [
      {
        authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: String,
        message: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    resolution: {
      action: { type: String, enum: ['release', 'refund', 'closed'] },
      notes: String,
      resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      resolvedAt: Date,
    },
  },
  { timestamps: true, collection: 'disputes' }
);

module.exports = mongoose.model('Dispute', disputeSchema);
