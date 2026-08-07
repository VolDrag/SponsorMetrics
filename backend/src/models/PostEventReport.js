const mongoose = require('mongoose');

const forensicsCheckSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      trim: true,
    },
    huggingFaceScore: {
      type: Number,
      min: 0,
      max: 1,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

const approvalCommentSchema = new mongoose.Schema(
  {
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const sponsorApprovalSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      trim: true,
      default: 'pending',
    },
    comments: {
      type: [approvalCommentSchema],
      default: [],
    },
  },
  { _id: false }
);

const postEventReportSchema = new mongoose.Schema(
  {
    campaignId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Campaign',
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
    },
    photos: {
      type: [String],
      default: [],
    },
    engagementScreenshots: {
      type: [String],
      default: [],
    },
    attendeeCount: {
      type: Number,
      min: 0,
    },
    forensicsCheck: {
      type: forensicsCheckSchema,
      default: {},
    },
    sponsorApproval: {
      type: sponsorApprovalSchema,
      default: {},
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    approvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'postevereports',
  }
);

const PostEventReport = mongoose.model('PostEventReport', postEventReportSchema);

module.exports = PostEventReport;
