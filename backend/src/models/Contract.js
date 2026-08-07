const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema(
  {
    dealId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Deal',
      required: true,
    },
    agreedBudget: {
      type: Number,
      required: true,
      min: 0,
    },
    eventDates: {
      type: Date,
      required: true,
    },
    promisedMaterials: {
      type: [String],
      default: [],
    },
    pdfUrl: {
      type: String,
      trim: true,
    },
    signedByOrganizer: {
      type: Boolean,
      default: false,
    },
    signedBySponsor: {
      type: Boolean,
      default: false,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'contracts',
  }
);

const Contract = mongoose.model('Contract', contractSchema);

module.exports = Contract;
