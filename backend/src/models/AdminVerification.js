const mongoose = require('mongoose');

const adminVerificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    documentUrls: {
      type: [String],
      default: [],
    },
    documentType: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'adminverifications',
  }
);

const AdminVerification = mongoose.model('AdminVerification', adminVerificationSchema);

module.exports = AdminVerification;
