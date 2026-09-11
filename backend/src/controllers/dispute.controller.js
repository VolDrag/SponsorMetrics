const Dispute = require('../models/Dispute');
const Campaign = require('../models/Campaign');
const { notify } = require('../services/notification.service');
const escrow = require('../services/escrow.service');

exports.create = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.body.campaignId);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    const uid = String(req.user._id);
    if (String(campaign.sponsorId) !== uid && req.user.role !== 'organizer' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    const dispute = await Dispute.create({
      campaignId: campaign._id,
      contractId: campaign.contractId,
      paymentId: campaign.paymentId,
      openedBy: req.user._id,
      reason: req.body.reason,
      evidence: req.body.evidence || [],
      thread: [{ authorId: req.user._id, role: req.user.role, message: req.body.reason }],
    });
    const other = String(campaign.sponsorId) === uid ? null : campaign.sponsorId;
    if (other) await notify(other, 'dispute_opened', 'A dispute was opened on a campaign.', dispute._id);
    res.status(201).json({ success: true, data: dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to open dispute', error: error.message });
  }
};

exports.list = async (req, res) => {
  const filter = req.user.role === 'admin' ? {} : { openedBy: req.user._id };
  const rows = await Dispute.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: rows });
};

exports.comment = async (req, res) => {
  const dispute = await Dispute.findById(req.params.disputeId);
  if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });
  dispute.thread.push({ authorId: req.user._id, role: req.user.role, message: req.body.message });
  await dispute.save();
  res.json({ success: true, data: dispute });
};

exports.resolve = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Admin only' });
  const dispute = await Dispute.findById(req.params.disputeId);
  if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });
  const action = req.body.action;
  if (action === 'refund' && dispute.paymentId) {
    await escrow.refundPayment(dispute.paymentId, { reason: req.body.notes || 'Dispute refund', actorId: req.user._id });
  }
  if (action === 'release' && dispute.paymentId) {
    const Payment = require('../models/Payment');
    const payment = await Payment.findById(dispute.paymentId);
    if (payment) {
      payment.escrowStatus = 'released';
      payment.releasedAt = new Date();
      await payment.save();
    }
  }
  dispute.status = action === 'closed' ? 'closed' : 'resolved';
  dispute.resolution = { action, notes: req.body.notes || '', resolvedBy: req.user._id, resolvedAt: new Date() };
  await dispute.save();
  res.json({ success: true, data: dispute });
};
