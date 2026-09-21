const Dispute = require('../models/Dispute');
const Campaign = require('../models/Campaign');
const Event = require('../models/Event');
const { notify } = require('../services/notification.service');
const escrow = require('../services/escrow.service');

const POPULATE = [
  { path: 'openedBy', select: 'name organizationName role' },
  { path: 'paymentId', select: 'amount escrowStatus status invoiceNumber' },
  {
    path: 'campaignId',
    select: 'eventId sponsorId spend escrowStatus',
    populate: { path: 'eventId', select: 'name date organizerId' },
  },
];

const campaignParties = async (campaign) => {
  const sponsorId = campaign.sponsorId;
  let organizerId = campaign.eventId?.organizerId;
  if (!organizerId && campaign.eventId) {
    const event = await Event.findById(campaign.eventId._id || campaign.eventId).select('organizerId');
    organizerId = event?.organizerId;
  }
  return { sponsorId, organizerId };
};

const isCampaignParty = async (campaign, user) => {
  if (user.role === 'admin') return true;
  const { sponsorId, organizerId } = await campaignParties(campaign);
  const uid = String(user._id);
  return String(sponsorId) === uid || String(organizerId) === uid;
};

exports.create = async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.body.campaignId);
    if (!campaign) return res.status(404).json({ success: false, message: 'Campaign not found' });
    if (!(await isCampaignParty(campaign, req.user))) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    const { sponsorId, organizerId } = await campaignParties(campaign);
    const dispute = await Dispute.create({
      campaignId: campaign._id,
      contractId: campaign.contractId,
      paymentId: campaign.paymentId,
      openedBy: req.user._id,
      reason: req.body.reason,
      evidence: req.body.evidence || [],
      thread: [{ authorId: req.user._id, role: req.user.role, message: req.body.reason }],
    });
    const uid = String(req.user._id);
    const counterpart = String(sponsorId) === uid ? organizerId : sponsorId;
    if (counterpart) {
      await notify(counterpart, 'dispute_opened', 'A dispute was opened on a campaign.', dispute._id);
    }
    const populated = await Dispute.findById(dispute._id).populate(POPULATE);
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to open dispute', error: error.message });
  }
};

exports.list = async (req, res) => {
  try {
    let filter = {};
    if (req.user.role !== 'admin') {
      const events = await Event.find({ organizerId: req.user._id }).select('_id');
      const campaigns = await Campaign.find({
        $or: [{ sponsorId: req.user._id }, { eventId: { $in: events.map((row) => row._id) } }],
      }).select('_id');
      filter = {
        $or: [{ openedBy: req.user._id }, { campaignId: { $in: campaigns.map((row) => row._id) } }],
      };
    }
    const rows = await Dispute.find(filter).populate(POPULATE).sort({ createdAt: -1 });
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list disputes', error: error.message });
  }
};

exports.comment = async (req, res) => {
  const dispute = await Dispute.findById(req.params.disputeId);
  if (!dispute) return res.status(404).json({ success: false, message: 'Dispute not found' });
  dispute.thread.push({ authorId: req.user._id, role: req.user.role, message: req.body.message });
  await dispute.save();
  const populated = await Dispute.findById(dispute._id).populate(POPULATE);
  res.json({ success: true, data: populated });
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
      await Campaign.updateOne({ paymentId: payment._id }, { escrowStatus: 'released' });
    }
  }
  dispute.status = action === 'closed' ? 'closed' : 'resolved';
  dispute.resolution = { action, notes: req.body.notes || '', resolvedBy: req.user._id, resolvedAt: new Date() };
  await dispute.save();
  const populated = await Dispute.findById(dispute._id).populate(POPULATE);
  res.json({ success: true, data: populated });
};
