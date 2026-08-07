const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    action: {
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

const teamMemberSchema = new mongoose.Schema(
  {
    sponsorOrgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invitedEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    permission: {
      type: String,
      enum: ['edit', 'view'],
      default: 'view',
    },
    assignedEvents: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Event',
        },
      ],
      default: [],
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'revoked'],
      default: 'pending',
    },
    activityLog: {
      type: [activityLogSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: 'teammembers',
  }
);

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);

module.exports = TeamMember;
