const User = require('../models/User');
const Proposal = require('../models/Proposal');
const PostEventMetrics = require('../models/PostEventMetrics');
const AdminVerification = require('../models/AdminVerification');
const Dispute = require('../models/Dispute');
const Payment = require('../models/Payment');
const { notify } = require('../services/notification.service');
const escrow = require('../services/escrow.service');

exports.dashboard = async (req, res) => {
  try {
    const [pendingKyc, flaggedProposals, flaggedPhotos, openDisputes, heldPayments] = await Promise.all([
      AdminVerification.countDocuments({ status: 'pending' }),
      Proposal.countDocuments({ fraudRiskScore: { $gte: 35 } }),
      PostEventMetrics.countDocuments({ 'crowdPhotos.mediaForensicsResult.flagged': true }),
      Dispute.countDocuments({ status: 'open' }),
      Payment.countDocuments({ escrowStatus: 'held' }),
    ]);
    res.json({
      success: true,
      data: { pendingKyc, flaggedProposals, flaggedPhotos, openDisputes, heldPayments },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load admin dashboard', error: error.message });
  }
};

exports.kycQueue = async (req, res) => {
  const rows = await AdminVerification.find({ status: req.query.status || 'pending' })
    .populate('userId', 'name email organizationName role kycStatus orgVerified')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: rows });
};

exports.reviewKyc = async (req, res) => {
  const doc = await AdminVerification.findById(req.params.verificationId);
  if (!doc) return res.status(404).json({ success: false, message: 'Verification not found' });
  const approved = req.body.decision === 'approved';
  doc.status = approved ? 'approved' : 'rejected';
  doc.reviewedBy = req.user._id;
  doc.reviewedAt = new Date();
  doc.rejectionReason = req.body.reason || '';
  await doc.save();
  await User.findByIdAndUpdate(doc.userId, {
    orgVerified: approved,
    kycStatus: approved ? 'approved' : 'rejected',
  });
  await notify(doc.userId, 'kyc_update', approved ? 'Your organization is verified.' : `KYC rejected: ${doc.rejectionReason || 'see notes'}`, doc._id);
  res.json({ success: true, data: doc });
};

exports.flaggedProposals = async (_req, res) => {
  const rows = await Proposal.find({ $or: [{ fraudRiskScore: { $gte: 35 } }, { fraudFlags: { $exists: true, $ne: [] } }] })
    .populate('organizerId', 'name email organizationName')
    .sort({ updatedAt: -1 })
    .limit(100);
  res.json({ success: true, data: rows });
};

exports.flaggedPhotos = async (_req, res) => {
  const rows = await PostEventMetrics.find({
    $or: [
      { 'crowdPhotos.mediaForensicsResult.flagged': true },
      { 'engagementScreenshots.mediaForensicsResult.flagged': true },
    ],
  })
    .populate('eventId', 'name')
    .limit(100);
  res.json({ success: true, data: rows });
};

exports.releasePayment = async (req, res) => {
  const payment = await Payment.findById(req.params.paymentId);
  if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
  payment.escrowStatus = 'released';
  payment.releasedAt = new Date();
  await payment.save();
  res.json({ success: true, data: payment });
};

exports.refundPayment = async (req, res) => {
  const payment = await escrow.refundPayment(req.params.paymentId, {
    amount: req.body.amount,
    reason: req.body.reason || 'Admin refund',
    actorId: req.user._id,
  });
  res.json({ success: true, data: payment });
};
