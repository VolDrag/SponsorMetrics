const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    orgId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action: { type: String, required: true, trim: true },
    meta: { type: Object, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: 'activitylogs' }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
