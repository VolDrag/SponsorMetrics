const Payment = require('../models/Payment');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const Event = require('../models/Event');
const bkash = require('./bkash.service');
const { generateInvoicePdf } = require('./invoice.service');
const { notify } = require('./notification.service');
const { sendInvoiceEmail } = require('./email.service');

const frontendOrigin = () => String(process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
const callbackUrl = () => `${frontendOrigin()}/payments/callback`;

exports.initiateForCampaign = async ({ campaign, proposal, deal }) => {
  const amount = Number(proposal.proposedBudget || campaign.spend || 0);
  const invoice = `SM-${String(campaign._id).slice(-8).toUpperCase()}`;
  const created = await bkash.createPayment({ amount, invoice, callbackURL: callbackUrl() });

  const checkoutUrl = created.mock
    ? `${callbackUrl()}?paymentID=${created.paymentID}&status=success`
    : created.bkashURL || '';

  const payment = await Payment.create({
    dealId: deal._id,
    campaignId: campaign._id,
    proposalId: proposal._id,
    contractId: campaign.contractId,
    sponsorId: proposal.sponsorId,
    organizerId: proposal.organizerId,
    amount,
    currency: 'BDT',
    status: 'initiated',
    escrowStatus: 'none',
    bkashPaymentID: created.paymentID,
    paymentGatewayRef: created.paymentID,
    invoiceNumber: invoice,
    checkoutUrl,
    mock: Boolean(created.mock),
  });

  campaign.paymentId = payment._id;
  campaign.bkashPaymentID = created.paymentID;
  campaign.escrowStatus = 'pending';
  await campaign.save();

  await notify(
    proposal.sponsorId,
    'payment_confirmation',
    `Pay BDT ${amount.toLocaleString()} on the Payments page to fund escrow for this sponsorship.`,
    payment._id
  );

  return { payment, bkashURL: checkoutUrl, mock: created.mock };
};

const attachInvoice = async (payment, proposal) => {
  const [sponsor, organizer, event] = await Promise.all([
    User.findById(payment.sponsorId).select('name organizationName email'),
    User.findById(payment.organizerId).select('name organizationName email'),
    proposal?.eventId ? Event.findById(proposal.eventId).select('name') : null,
  ]);
  const pdf = await generateInvoicePdf({
    payment,
    sponsor,
    organizer,
    eventName: event?.name,
  });
  payment.invoiceUrl = pdf.url;
  await payment.save();
  if (sponsor?.email) {
    await sendInvoiceEmail(sponsor.email, sponsor.name, pdf.filePath, payment).catch((err) =>
      console.warn('[invoice] email skipped:', err.message)
    );
  }
};

exports.executeAndHold = async (paymentID) => {
  const payment = await Payment.findOne({ bkashPaymentID: paymentID });
  if (!payment) return null;
  if (payment.escrowStatus === 'held' || payment.escrowStatus === 'released') {
    return payment;
  }
  if (payment.status === 'refunded' || payment.escrowStatus === 'refunded') {
    return payment;
  }
  const executed = await bkash.executePayment(paymentID);
  const query = await bkash.queryPayment(paymentID);
  const ok = /complete/i.test(String(executed.transactionStatus || query.transactionStatus || 'Completed'));
  payment.status = ok ? 'completed' : 'failed';
  payment.trxID = executed.trxID || query.trxID;
  payment.executedAt = new Date();
  if (ok) {
    payment.escrowStatus = 'held';
    payment.heldAt = new Date();
  }
  await payment.save();
  if (ok) {
    await Campaign.updateOne(
      { _id: payment.campaignId },
      { escrowStatus: 'held', bkashPaymentID: paymentID, paymentId: payment._id }
    );
    await attachInvoice(payment, { eventId: (await Campaign.findById(payment.campaignId))?.eventId });
    await notify(payment.organizerId, 'payment_received', 'Sponsor funds are held in escrow.', payment._id);
  }
  return payment;
};

exports.checkout = async (payment, { recreate = false } = {}) => {
  if (payment.escrowStatus === 'held' || payment.escrowStatus === 'released') {
    return { payment, alreadyFunded: true };
  }
  if (payment.mock || bkash.isMock() || String(payment.bkashPaymentID || '').startsWith('mock_')) {
    const funded = await exports.executeAndHold(payment.bkashPaymentID);
    return { payment: funded, alreadyFunded: false };
  }
  if (payment.checkoutUrl && !recreate) {
    return { payment, bkashURL: payment.checkoutUrl };
  }
  const created = await bkash.createPayment({
    amount: payment.amount,
    invoice: payment.invoiceNumber,
    callbackURL: callbackUrl(),
  });
  payment.bkashPaymentID = created.paymentID;
  payment.paymentGatewayRef = created.paymentID;
  payment.checkoutUrl = created.bkashURL || '';
  payment.status = 'initiated';
  await payment.save();
  await Campaign.updateOne(
    { _id: payment.campaignId },
    { bkashPaymentID: created.paymentID, escrowStatus: 'pending' }
  );
  return { payment, bkashURL: payment.checkoutUrl };
};

exports.releaseOnReportApproval = async (proposalId) => {
  const payment = await Payment.findOne({ proposalId, escrowStatus: 'held' });
  if (!payment) return null;
  payment.escrowStatus = 'released';
  payment.releasedAt = new Date();
  await payment.save();
  await Campaign.updateOne({ paymentId: payment._id }, { escrowStatus: 'released' });
  await notify(payment.organizerId, 'payment_received', 'Escrow released after report approval.', payment._id);
  await notify(payment.sponsorId, 'report_approved', 'Report approved. Escrow released to the organizer.', payment._id);
  return payment;
};

exports.refundPayment = async (paymentId, { amount, reason, actorId }) => {
  const payment = await Payment.findById(paymentId);
  if (!payment) return null;
  if (payment.status === 'refunded' || payment.escrowStatus === 'refunded') return payment;
  const refundAmount = amount != null ? Number(amount) : payment.amount;
  const result = await bkash.refundPayment({
    paymentID: payment.bkashPaymentID,
    trxID: payment.trxID,
    amount: refundAmount,
    reason,
  });
  payment.status = 'refunded';
  payment.escrowStatus = 'refunded';
  payment.refund = { amount: refundAmount, reason, refundTrxID: result.refundTrxID, at: new Date(), by: actorId };
  await payment.save();
  await Campaign.updateOne({ paymentId: payment._id }, { escrowStatus: 'refunded' });
  return payment;
};
