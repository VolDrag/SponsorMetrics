const Notification = require('../models/Notification');
const { emitToUser } = require('../realtime');

const ALLOWED = [
  'counter_offer',
  'payment_confirmation',
  'report_ready',
  'overspend_warning',
  'goal_milestone',
  'subscription_renewal',
  'review_prompt',
  'proposal_viewed',
  'proposal_accepted',
  'proposal_rejected',
  'payment_received',
  'report_approved',
  'dispute_opened',
  'contract_ready',
  'team_invite',
  'kyc_update',
];

exports.notify = async (userId, type, message, relatedId) => {
  if (!userId || !message) return null;
  const safeType = ALLOWED.includes(type) ? type : 'goal_milestone';
  const doc = await Notification.create({
    userId,
    type: safeType,
    message,
    relatedId: relatedId || undefined,
  });
  emitToUser(userId, 'notification', {
    _id: doc._id,
    type: doc.type,
    message: doc.message,
    isRead: false,
    createdAt: doc.createdAt,
  });
  return doc;
};
