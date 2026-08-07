const mongoose = require('mongoose');

const whiteLabelReportSchema = new mongoose.Schema(
  {
    sponsorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    periodCovered: {
      type: String,
      required: true,
      trim: true,
    },
    pdfUrl: {
      type: String,
      trim: true,
    },
    scheduledDelivery: {
      type: Boolean,
      default: false,
    },
    deliveryDay: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'whitelabelreports',
  }
);

const WhiteLabelReport = mongoose.model('WhiteLabelReport', whiteLabelReportSchema);

module.exports = WhiteLabelReport;
