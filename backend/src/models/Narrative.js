const mongoose = require('mongoose');

const narrativeSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    rawKPIs: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    generatedText: {
      type: String,
      trim: true,
    },
    finalText: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'narratives',
  }
);

const Narrative = mongoose.model('Narrative', narrativeSchema);

module.exports = Narrative;
