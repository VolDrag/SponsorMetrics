const mongoose = require('mongoose');

const signatureSchema = new mongoose.Schema(
  {
    fullName: String,
    signedAt: Date,
    ip: String,
    documentHash: String,
  },
  { _id: false }
);

const contractSchema = new mongoose.Schema(
  {
    dealId: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal', required: true },
    proposalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' },
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    agreedBudget: { type: Number, required: true, min: 0 },
    eventDates: { type: Date, required: true },
    promisedMaterials: { type: [String], default: [] },
    pdfUrl: { type: String, trim: true },
    documentHash: { type: String, trim: true },
    signedByOrganizer: { type: Boolean, default: false },
    signedBySponsor: { type: Boolean, default: false },
    organizerSignature: signatureSchema,
    sponsorSignature: signatureSchema,
    status: {
      type: String,
      enum: ['unsigned', 'partially_signed', 'executed'],
      default: 'unsigned',
    },
    generatedAt: { type: Date, default: Date.now },
    executedAt: { type: Date },
  },
  { timestamps: true, collection: 'contracts' }
);

module.exports = mongoose.model('Contract', contractSchema);
