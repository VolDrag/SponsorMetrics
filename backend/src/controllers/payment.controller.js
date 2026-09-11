const Payment = require('../models/Payment');
const Campaign = require('../models/Campaign');
const escrow = require('../services/escrow.service');
const bkash = require('../services/bkash.service');

exports.listMine = async (req, res) => {
  try {
    const filter = req.user.role === 'sponsor' ? { sponsorId: req.user._id } : { organizerId: req.user._id };
    if (req.user.role === 'admin') Object.assign(filter, {});
    const query = req.user.role === 'admin' ? {} : filter;
    const rows = await Payment.find(query).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list payments', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    const uid = String(req.user._id);
    if (req.user.role !== 'admin' && String(payment.sponsorId) !== uid && String(payment.organizerId) !== uid) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load payment', error: error.message });
  }
};

exports.callback = async (req, res) => {
  try {
    const paymentID = req.query.paymentID || req.body.paymentID;
    if (!paymentID) return res.status(400).json({ success: false, message: 'paymentID required' });
    const payment = await escrow.executeAndHold(paymentID);
    if (!payment) return res.status(404).json({ success: false, message: 'Unknown payment' });
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Payment callback failed', error: error.message });
  }
};

exports.webhook = async (req, res) => {
  try {
    const header = req.headers['x-bkash-signature'] || req.headers['x-signature'];
    const raw = JSON.stringify(req.body || {});
    if (!bkash.verifyWebhook(raw, header)) {
      return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }
    const paymentID = req.body.paymentID || req.body.paymentId;
    if (paymentID) await escrow.executeAndHold(paymentID);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Webhook failed', error: error.message });
  }
};

exports.release = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    payment.escrowStatus = 'released';
    payment.releasedAt = new Date();
    await payment.save();
    await Campaign.updateOne({ paymentId: payment._id }, { escrowStatus: 'released' });
    res.json({ success: true, data: payment, message: 'Escrow released' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Release failed', error: error.message });
  }
};

exports.refund = async (req, res) => {
  try {
    const payment = await escrow.refundPayment(req.params.paymentId, {
      amount: req.body.amount,
      reason: req.body.reason,
      actorId: req.user._id,
    });
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    res.json({ success: true, data: payment, message: 'Refund issued' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Refund failed', error: error.message });
  }
};
