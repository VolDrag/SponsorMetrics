const mongoose = require('mongoose');

const savedEventSchema = new mongoose.Schema(
  {
    sponsorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    notifyOnDateChange: {
      type: Boolean,
      default: true,
    },
    notifyOnDeadline: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'savedevents',
  }
);

const SavedEvent = mongoose.model('SavedEvent', savedEventSchema);

module.exports = SavedEvent;
