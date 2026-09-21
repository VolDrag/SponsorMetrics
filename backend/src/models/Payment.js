const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' },
    proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' },
    contractId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contract' },
    sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    vatAmount: { type: Number, default: 0 },
    aitAmount: { type: Number, default: 0 },
    currency: { type: String, default: 'BDT' },
    status: {
      type: String,
      enum: ['initiated', 'executed', 'completed', 'failed', 'refunded'],
      default: 'initiated',
    },
    escrowStatus: {
      type: String,
      enum: ['none', 'held', 'released', 'refunded'],
      default: 'none',
    },
    bkashPaymentID: { type: String, trim: true },
    paymentGatewayRef: { type: String, trim: true },
    trxID: { type: String, trim: true },
    invoiceNumber: { type: String, trim: true },
    invoiceUrl: { type: String, trim: true },
    checkoutUrl: { type: String, trim: true },
    mock: { type: Boolean, default: false },
    heldAt: { type: Date },
    executedAt: { type: Date },
    releasedAt: { type: Date },
    refund: {
      amount: Number,
      reason: String,
      refundTrxID: String,
      at: Date,
      by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    },
  },
  { timestamps: true, collection: 'payments' }
);

module.exports = mongoose.model('Payment', paymentSchema);
