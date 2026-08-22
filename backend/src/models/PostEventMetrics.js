const mongoose = require('mongoose');

// ===== MODULE 3 FEATURE 2: Sponsorship Performance & ROI Analytics — START =====
const mediaForensicsResultSchema = new mongoose.Schema(
  {
    aiGeneratedScore: { type: Number, default: null },
    isDuplicate: { type: Boolean, default: false },
    duplicateOfEventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', default: null },
    flagged: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ['Verified', 'Needs Review', 'Unverified'],
      default: 'Unverified',
    },
  },
  { _id: false }
);

const reportPhotoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    mediaForensicsResult: { type: mediaForensicsResultSchema, default: () => ({}) },
  },
  { _id: true }
);

const reportCommentSchema = new mongoose.Schema(
  {
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['organizer', 'sponsor'], required: true },
    comment: { type: String, required: true, trim: true, maxlength: 2000 },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const postEventMetricsSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    proposalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal',
      required: true,
      unique: true,
    },
    totalReach: {
      type: Number,
      required: true,
      min: 0,
    },
    totalEngagement: {
      type: Number,
      required: true,
      min: 0,
    },
    attendeeCount: {
      type: Number,
      required: true,
      min: 0,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    // ===== MODULE 4 FEATURE 2: Post-Event Report & Approval Workflow — START =====
    crowdPhotos: { type: [reportPhotoSchema], default: [] },
    engagementScreenshots: { type: [reportPhotoSchema], default: [] },
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Under Review', 'Revision Requested', 'Approved'],
      default: 'Draft',
      index: true,
    },
    reviewComments: { type: [reportCommentSchema], default: [] },
    signOff: {
      sponsorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      approvedAt: { type: Date },
    },
    // ===== MODULE 4 FEATURE 2: Post-Event Report & Approval Workflow — END =====
  },
  {
    timestamps: true,
    collection: 'posteventmetrics',
  }
);

module.exports = mongoose.model('PostEventMetrics', postEventMetricsSchema);
// ===== MODULE 3 FEATURE 2: Sponsorship Performance & ROI Analytics — END =====
