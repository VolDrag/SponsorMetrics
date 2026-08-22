const similarity = require('string-similarity');
const User = require('../models/User');
const Proposal = require('../models/Proposal');
const Event = require('../models/Event');

// ===== MODULE 4 FEATURE 3: AI Fraud & Spam Detection — START =====
const MAX_BUDGET_PER_ATTENDEE = Number(process.env.MAX_BUDGET_PER_ATTENDEE || 5000);
const COPY_PASTE_THRESHOLD = 0.9;
const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com',
  'icloud.com', 'proton.me', 'protonmail.com', 'aol.com', 'mail.com',
]);

const INSTITUTION_HINT = /university|college|institute|school|hospital|bank|limited|ltd|ngo|foundation/i;

const ngramScore = (a, b) => {
  const left = String(a || '').trim().toLowerCase();
  const right = String(b || '').trim().toLowerCase();
  if (!left || !right) return 0;
  return similarity.compareTwoStrings(left, right);
};

exports.screenProposal = async ({ proposal, organizer, event }) => {
  const flags = [];
  const org = organizer || (await User.findById(proposal.organizerId));
  const eventDoc = event || (proposal.eventId ? await Event.findById(proposal.eventId) : null);

  if (!org?.website) {
    flags.push('no organization website on file');
  }

  const domain = String(org?.email || '').split('@')[1] || '';
  const claimsInstitution =
    INSTITUTION_HINT.test(org?.organizationName || '') ||
    ['university_club', 'ngo'].includes(org?.organizationType);
  if (claimsInstitution && FREE_EMAIL_DOMAINS.has(domain.toLowerCase())) {
    flags.push('generic free-email domain used for an institutional organization');
  }

  if (org?.organizationName) {
    const others = await User.find({
      _id: { $ne: org._id },
      organizationName: { $exists: true, $ne: '' },
    }).select('organizationName');
    const match = others.find((row) => ngramScore(org.organizationName, row.organizationName) >= 0.9);
    if (match) {
      flags.push(`organization name closely duplicates "${match.organizationName}"`);
    }
  }

  const attendees = Number(eventDoc?.expectedCrowdSize || 0);
  const budget = Number(proposal.proposedBudget || 0);
  if (attendees > 0 && budget / attendees > MAX_BUDGET_PER_ATTENDEE) {
    flags.push(
      `budget per expected attendee exceeds ceiling of BDT ${MAX_BUDGET_PER_ATTENDEE} (tune MAX_BUDGET_PER_ATTENDEE)`
    );
  }

  const text = `${proposal.body || ''} ${proposal.notes || ''} ${proposal.rawBulletPoints || ''}`.trim();
  if (text.length > 40) {
    const others = await Proposal.find({
      ...(proposal._id ? { _id: { $ne: proposal._id } } : {}),
      eventId: { $ne: proposal.eventId },
      $or: [{ body: { $ne: '' } }, { notes: { $ne: '' } }],
    })
      .select('body notes eventId')
      .limit(50);

    const copy = others.find((row) => ngramScore(text, `${row.body || ''} ${row.notes || ''}`) >= COPY_PASTE_THRESHOLD);
    if (copy) {
      flags.push('proposal text is over 90% similar to another proposal for an unrelated event');
    }
  }

  const fraudRiskScore = Math.min(100, flags.length * 35);
  return { flags, fraudRiskScore };
};

exports.holdMessage = (flags) =>
  `Your proposal was flagged for ${flags.join('; ')} and needs revision before it can be sent`;
// ===== MODULE 4 FEATURE 3: AI Fraud & Spam Detection — END =====
