const Payment = require('../models/Payment');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const Event = require('../models/Event');
const bkash = require('./bkash.service');
const { generateInvoicePdf } = require('./invoice.service');
const { notify } = require('./notification.service');
const { sendInvoiceEmail } = require('./email.service');

exports.initiateForCampaign = async ({ campaign, proposal, deal }) => {
  const amount = Number(proposal.proposedBudget || campaign.spend || 0);
  const invoice = `SM-${String(campaign._id).slice(-8).toUpperCase()}`;
  const created = await bkash.createPayment({ amount, invoice });

  const payment = await Payment.create({
    dealId: deal._id,
    campaignId: campaign._id,
    proposalId: proposal._id,
    sponsorId: proposal.sponsorId,
    organizerId: proposal.organizerId,
    amount,
    currency: 'BDT',
    status: created.mock ? 'executed' : 'initiated',
    escrowStatus: created.mock ? 'held' : 'none',
    bkashPaymentID: created.paymentID,
    paymentGatewayRef: created.paymentID,
    invoiceNumber: invoice,
    heldAt: created.mock ? new Date() : null,
    mock: Boolean(created.mock),
  });

  if (created.mock) {
    const executed = await bkash.executePayment(created.paymentID);
    payment.trxID = executed.trxID;
    payment.status = 'completed';
    payment.escrowStatus = 'held';
    payment.executedAt = new Date();
    await payment.save();
    await attachInvoice(payment, proposal);
  }

  campaign.paymentId = payment._id;
  campaign.bkashPaymentID = created.paymentID;
  campaign.escrowStatus = payment.escrowStatus === 'held' ? 'held' : 'pending';
  await campaign.save();

  await notify(
    proposal.sponsorId,
    'payment_confirmation',
    created.mock
      ? `Sandbox escrow of BDT ${amount.toLocaleString()} is held for this sponsorship.`
      : `Complete bKash payment of BDT ${amount.toLocaleString()} to fund escrow.`,
    payment._id
  );

  return { payment, bkashURL: created.bkashURL, mock: created.mock };
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
