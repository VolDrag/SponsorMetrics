const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal',
    },
    contractId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
    },
    sponsorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['held_in_escrow', 'released', 'refunded', 'disputed'],
      default: 'held_in_escrow',
    },
    paymentGatewayRef: {
      type: String,
      trim: true,
    },
    heldAt: {
      type: Date,
    },
    releasedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'payments',
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
