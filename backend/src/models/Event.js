// ifty
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    expectedCrowdSize: {
      type: Number,
      min: 0,
    },
    venue: {
      type: String,
      trim: true,
    },
    location: {
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      },
    },
    socialMediaReach: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'completed'],
      default: 'draft',
    },
    date: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'events',
  }
);

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
// ifty end
