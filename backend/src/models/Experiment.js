const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema(
  {
    format: {
      type: String,
      required: true,
      trim: true,
    },
    value: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const experimentSchema = new mongoose.Schema(
  {
    sponsorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    formatsCompared: {
      type: [String],
      default: [],
    },
    primaryMetric: {
      type: String,
      trim: true,
    },
    results: {
      type: [resultSchema],
      default: [],
    },
    winningFormat: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'experiments',
  }
);

const Experiment = mongoose.model('Experiment', experimentSchema);

module.exports = Experiment;
