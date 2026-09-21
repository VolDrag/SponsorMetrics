const Payment = require('../models/Payment');
const Campaign = require('../models/Campaign');
const escrow = require('../services/escrow.service');
const bkash = require('../services/bkash.service');

const PAYMENT_POPULATE = [
  { path: 'sponsorId', select: 'name organizationName email' },
  { path: 'organizerId', select: 'name organizationName email' },
  {
    path: 'campaignId',
    select: 'eventId spend escrowStatus',
    populate: { path: 'eventId', select: 'name date venue' },
  },
  { path: 'proposalId', select: 'proposedBudget status' },
];

const frontendOrigin = () => String(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

const wantsRedirect = (req) => {
  const accept = String(req.headers.accept || '');
  return req.method === 'GET' && accept.includes('text/html') && !accept.includes('application/json');
};

const canAccess = (req, payment) => {
  const uid = String(req.user._id);
  return (
    req.user.role === 'admin' ||
    String(payment.sponsorId?._id || payment.sponsorId) === uid ||
    String(payment.organizerId?._id || payment.organizerId) === uid
  );
};

exports.listMine = async (req, res) => {
  try {
    const query =
      req.user.role === 'admin'
        ? {}
        : req.user.role === 'sponsor'
          ? { sponsorId: req.user._id }
          : { organizerId: req.user._id };
    const rows = await Payment.find(query).populate(PAYMENT_POPULATE).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list payments', error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId).populate(PAYMENT_POPULATE);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    if (!canAccess(req, payment)) {
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
    const gatewayStatus = String(req.query.status || req.body.status || 'success').toLowerCase();
    if (!paymentID) return res.status(400).json({ success: false, message: 'paymentID required' });

    if (['failure', 'failed', 'cancel', 'cancelled'].includes(gatewayStatus)) {
      await Payment.updateOne({ bkashPaymentID: paymentID, status: 'initiated' }, { status: 'failed' });
      if (wantsRedirect(req)) {
        return res.redirect(`${frontendOrigin()}/payments?status=cancelled`);
      }
      return res.json({ success: false, message: 'Payment cancelled' });
    }

    const payment = await escrow.executeAndHold(paymentID);
    if (!payment) {
      if (wantsRedirect(req)) return res.redirect(`${frontendOrigin()}/payments?status=unknown`);
      return res.status(404).json({ success: false, message: 'Unknown payment' });
    }
    if (wantsRedirect(req)) {
      return res.redirect(`${frontendOrigin()}/payments?status=funded`);
    }
    const populated = await Payment.findById(payment._id).populate(PAYMENT_POPULATE);
    res.json({ success: true, data: populated });
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

exports.checkout = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    const uid = String(req.user._id);
    if (req.user.role !== 'admin' && String(payment.sponsorId) !== uid) {
      return res.status(403).json({ success: false, message: 'Only the sponsor can fund this escrow' });
    }
    const result = await escrow.checkout(payment);
    const populated = await Payment.findById(result.payment._id).populate(PAYMENT_POPULATE);
    res.json({
      success: true,
      data: populated,
      bkashURL: result.bkashURL || null,
      alreadyFunded: Boolean(result.alreadyFunded),
      message: result.alreadyFunded
        ? 'Escrow is already funded'
        : result.bkashURL
          ? 'Continue to bKash to complete payment'
          : 'Sandbox escrow funded',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Checkout failed', error: error.message });
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
    const payment = await Payment.findById(req.params.paymentId);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
    const uid = String(req.user._id);
    if (req.user.role === 'sponsor' && String(payment.sponsorId) !== uid) {
      return res.status(403).json({ success: false, message: 'Not allowed' });
    }
    if (req.user.role === 'sponsor' && payment.escrowStatus !== 'held') {
      return res.status(400).json({ success: false, message: 'Only held escrow can be refunded' });
    }
    const updated = await escrow.refundPayment(req.params.paymentId, {
      amount: req.body.amount,
      reason: req.body.reason,
      actorId: req.user._id,
    });
    res.json({ success: true, data: updated, message: 'Refund issued' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Refund failed', error: error.message });
  }
};
