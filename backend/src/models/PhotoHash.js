const mongoose = require('mongoose');

// ===== MODULE 4 FEATURE 3: Media Forensics — START =====
const photoHashSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    url: { type: String, required: true },
    hash: { type: String, required: true, index: true },
  },
  { timestamps: true, collection: 'photohashes' }
);

module.exports = mongoose.model('PhotoHash', photoHashSchema);
// ===== MODULE 4 FEATURE 3: Media Forensics — END =====
