// MODULE 2 controller — Feature 1: Proposal Creator, Feature 2: Negotiation,
// Feature 3: Portfolio (campaign created on accept), Feature 4: Status Tracker
const Proposal = require('../models/Proposal');
const Event = require('../models/Event');
const SponsorshipTier = require('../models/SponsorshipTier');
const User = require('../models/User');
const Deal = require('../models/Deal'); // MODULE 2 | Feature 2: used when a proposal is accepted
const Campaign = require('../models/Campaign'); // MODULE 2 | Feature 3: portfolio card created on accept
const { rewriteProposal } = require('../services/gemini.service'); // MODULE 2 | Feature 1: AI Proposal Assistant

const POPULATE = [
  { path: 'eventId', select: 'name venue date expectedCrowdSize socialMediaReach status organizerId' },
  { path: 'selectedTierId', select: 'name price benefits isCustom eventId' },
  { path: 'sponsorId', select: 'name email organizationName industry budgetTier' },
  { path: 'organizerId', select: 'name email organizationName' },
  { path: 'counterOffers.offeredBy', select: 'name organizationName role' }, // MODULE 2 | Feature 2
];

const findOwnedEvent = async (eventId, organizerId) => {
  return Event.findOne({ _id: eventId, organizerId });
};

const assertTierBelongsToEvent = async (tierId, eventId) => {
  if (!tierId) return null;
  const tier = await SponsorshipTier.findById(tierId);
  if (!tier) {
    const error = new Error('Sponsorship tier not found');
    error.statusCode = 404;
    throw error;
  }
  if (tier.eventId.toString() !== eventId.toString()) {
    const error = new Error('Selected tier does not belong to this event');
    error.statusCode = 400;
    throw error;
  }
  return tier;
};

const assertSponsor = async (sponsorId) => {
  if (!sponsorId) return null;
  const sponsor = await User.findOne({ _id: sponsorId, role: 'sponsor', isActive: { $ne: false } });
  if (!sponsor) {
    const error = new Error('Sponsor not found');
    error.statusCode = 404;
    throw error;
  }
  return sponsor;
};

const canEditProposal = (proposal) => {
  return ['drafted'].includes(proposal.status);
};

// ========== MODULE 2 | Feature 1: Proposal Creator — START ==========
// @desc    Create a sponsorship proposal (draft, or send immediately)
// @route   POST /api/proposals
// @access  Private (Organizer)
exports.createProposal = async (req, res) => {
  try {
    const {
      eventId,
      selectedTierId,
      sponsorId,
      notes,
      goals,
      rawBulletPoints,
      body,
      aiGeneratedText,
      proposedBudget,
      send,
    } = req.body;

    const event = await findOwnedEvent(eventId, req.user._id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or you do not have permission',
      });
    }

    const tier = await assertTierBelongsToEvent(selectedTierId, eventId);
    await assertSponsor(sponsorId);

    const shouldSend = Boolean(send);
    if (shouldSend && !sponsorId) {
      return res.status(400).json({
        success: false,
        message: 'A sponsor is required to send this proposal',
      });
    }

    const proposal = await Proposal.create({
      eventId,
      organizerId: req.user._id,
      selectedTierId: selectedTierId || undefined,
      sponsorId: sponsorId || undefined,
      notes: notes || '',
      goals: goals || '',
      rawBulletPoints: rawBulletPoints || '',
      body: body || '',
      aiGeneratedText: aiGeneratedText || '',
      proposedBudget:
        proposedBudget !== undefined && proposedBudget !== null && proposedBudget !== ''
          ? Number(proposedBudget)
          : tier
            ? tier.price
            : 0,
      status: shouldSend ? 'sent' : 'drafted',
      sentAt: shouldSend ? new Date() : null,
    });

    const populated = await Proposal.findById(proposal._id).populate(POPULATE);

    res.status(201).json({
      success: true,
      message: shouldSend ? 'Proposal sent to sponsor' : 'Proposal saved as draft',
      data: populated,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Failed to create proposal',
      error: error.message,
    });
  }
};

// @desc    List logged-in organizer's proposals
// @route   GET /api/proposals/my-proposals
// @access  Private (Organizer)
exports.getMyProposals = async (req, res) => {
  try {
    const proposals = await Proposal.find({ organizerId: req.user._id })
      .populate(POPULATE)
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: proposals.length,
      data: proposals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proposals',
      error: error.message,
    });
  }
};

// @desc    List active sponsors (for send-to dropdown)
// @route   GET /api/proposals/sponsors
// @access  Private (Organizer)
exports.getSponsors = async (req, res) => {
  try {
    const sponsors = await User.find({ role: 'sponsor', isActive: { $ne: false } })
      .select('name email organizationName industry budgetTier isVerified credibilityScore')
      .sort({ organizationName: 1, name: 1 });

    res.status(200).json({
      success: true,
      count: sponsors.length,
      data: sponsors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sponsors',
      error: error.message,
    });
  }
};

// @desc    Get a single proposal
// @route   GET /api/proposals/:proposalId
// @access  Private (owner organizer, assigned sponsor, or admin)
exports.getProposalById = async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.proposalId).populate(POPULATE);

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found',
      });
    }

    const userId = req.user._id.toString();
    const isOwner = proposal.organizerId && proposal.organizerId._id.toString() === userId;
    const isSponsor =
      proposal.sponsorId && proposal.sponsorId._id.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isSponsor && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this proposal',
      });
    }

    // MODULE 2 | Feature 2 + Feature 4: first sponsor view moves Sent → Viewed
    if (isSponsor && proposal.status === 'sent') {
      proposal.status = 'viewed';
      proposal.viewedAt = new Date();
      await proposal.save();
    }

    const refreshed = await Proposal.findById(proposal._id).populate(POPULATE);

    res.status(200).json({
      success: true,
      data: refreshed,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proposal',
      error: error.message,
    });
  }
};

// @desc    Update a draft proposal
// @route   PUT /api/proposals/:proposalId
// @access  Private (Organizer owner)
exports.updateProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findOne({
      _id: req.params.proposalId,
      organizerId: req.user._id,
    });

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found or you do not have permission',
      });
    }

    if (!canEditProposal(proposal)) {
      return res.status(400).json({
        success: false,
        message: 'Only drafted proposals can be edited',
      });
    }

    const allowed = [
      'eventId',
      'selectedTierId',
      'sponsorId',
      'notes',
      'goals',
      'rawBulletPoints',
      'body',
      'aiGeneratedText',
      'proposedBudget',
    ];

    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field] === '' ? null : req.body[field];
      }
    });

    if (updates.eventId) {
      const event = await findOwnedEvent(updates.eventId, req.user._id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found or you do not have permission',
        });
      }
    }

    const eventId = updates.eventId || proposal.eventId;
    if (updates.selectedTierId) {
      const tier = await assertTierBelongsToEvent(updates.selectedTierId, eventId);
      if (updates.proposedBudget === undefined && tier) {
        updates.proposedBudget = tier.price;
      }
    }

    if (updates.sponsorId) {
      await assertSponsor(updates.sponsorId);
    }

    const updated = await Proposal.findByIdAndUpdate(
      req.params.proposalId,
      updates,
      { new: true, runValidators: true }
    ).populate(POPULATE);

    res.status(200).json({
      success: true,
      message: 'Proposal updated successfully',
      data: updated,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Failed to update proposal',
      error: error.message,
    });
  }
};

// @desc    Send a draft proposal to a sponsor
// @route   POST /api/proposals/:proposalId/send
// @access  Private (Organizer owner)
exports.sendProposal = async (req, res) => {
  try {
    const proposal = await Proposal.findOne({
      _id: req.params.proposalId,
      organizerId: req.user._id,
    });

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Proposal not found or you do not have permission',
      });
    }

    if (proposal.status !== 'drafted') {
      return res.status(400).json({
        success: false,
        message: 'Only drafted proposals can be sent',
      });
    }

    const sponsorId = req.body.sponsorId || proposal.sponsorId;
    if (!sponsorId) {
      return res.status(400).json({
        success: false,
        message: 'A sponsor is required to send this proposal',
      });
    }

    await assertSponsor(sponsorId);

    if (!proposal.selectedTierId) {
      return res.status(400).json({
        success: false,
        message: 'Select a sponsorship tier before sending',
      });
    }

    proposal.sponsorId = sponsorId;
    proposal.status = 'sent';
    proposal.sentAt = new Date();
    await proposal.save();

    const populated = await Proposal.findById(proposal._id).populate(POPULATE);

    res.status(200).json({
      success: true,
      message: 'Proposal sent to sponsor',
      data: populated,
    });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : 'Failed to send proposal',
      error: error.message,
    });
  }
};

// @desc    Gemini "Help Me Write" — rewrite rough bullets into professional copy
// @route   POST /api/proposals/ai-assist
// @access  Private (Organizer)
exports.aiAssist = async (req, res) => {
  try {
    const { bulletPoints, proposalId, eventId, notes, goals } = req.body;

    let context = { notes, goals };
    let proposal = null;

    if (proposalId) {
      proposal = await Proposal.findOne({
        _id: proposalId,
        organizerId: req.user._id,
      });
      if (!proposal) {
        return res.status(404).json({
          success: false,
          message: 'Proposal not found or you do not have permission',
        });
      }
    }

    const resolvedEventId = eventId || proposal?.eventId;
    if (resolvedEventId) {
      const event = await Event.findById(resolvedEventId);
      if (event) {
        context = {
          ...context,
          eventName: event.name,
          venue: event.venue,
          expectedCrowdSize: event.expectedCrowdSize,
        };
      }
    }

    const tierId = proposal?.selectedTierId;
    if (tierId) {
      const tier = await SponsorshipTier.findById(tierId);
      if (tier) {
        context.tierName = tier.name;
        context.proposedBudget = proposal.proposedBudget || tier.price;
      }
    }

    const result = await rewriteProposal(bulletPoints, context);

    if (proposal && canEditProposal(proposal)) {
      proposal.rawBulletPoints = bulletPoints;
      proposal.aiGeneratedText = result.text;
      await proposal.save();
    }

    res.status(200).json({
      success: true,
      message: result.source === 'gemini'
        ? 'Proposal rewritten by AI'
        : 'Proposal rewritten (local assistant — set GEMINI_API_KEY for Gemini)',
      data: {
        text: result.text,
        source: result.source,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate proposal text',
      error: error.message,
    });
  }
};
// ========== MODULE 2 | Feature 1: Proposal Creator — END ==========

// ========== MODULE 2 | Feature 2: Proposal Review & In-Platform Negotiation — START ==========
const NEGOTIABLE_STATUSES = ['sent', 'viewed', 'negotiation'];

const findAccessibleProposal = async (proposalId, user) => {
  const proposal = await Proposal.findById(proposalId);
  if (!proposal) return { error: { statusCode: 404, message: 'Proposal not found' } };

  const userId = user._id.toString();
  const isOwner = proposal.organizerId && proposal.organizerId.toString() === userId;
  const isAssignedSponsor = proposal.sponsorId && proposal.sponsorId.toString() === userId;
  const isAdmin = user.role === 'admin';

  if (!isOwner && !isAssignedSponsor && !isAdmin) {
    return { error: { statusCode: 403, message: 'You do not have permission to access this proposal' } };
  }

  return { proposal, isOwner, isAssignedSponsor };
};

const latestPendingCounter = (proposal) => {
  const pending = (proposal.counterOffers || []).filter((offer) => offer.status === 'pending');
  return pending.length ? pending[pending.length - 1] : null;
};

// MODULE 2 | Feature 3: derive Active/Upcoming/Completed for the new portfolio campaign
const campaignStatusFromEventDate = (eventDate) => {
  if (!eventDate) return 'upcoming';
  const now = new Date();
  const date = new Date(eventDate);
  if (date < now) return 'completed';
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  if (date - now <= weekMs) return 'active';
  return 'upcoming';
};

// MODULE 2 | Feature 2 + Feature 3: persist accepted deal and create a portfolio campaign
const finalizeAcceptedDeal = async (proposal) => {
  const existingDeal = await Deal.findOne({
    eventId: proposal.eventId,
    organizerId: proposal.organizerId,
    sponsorId: proposal.sponsorId,
    status: 'accepted',
  });

  const mappedCounters = (proposal.counterOffers || []).map((offer) => ({
    offeredBy: offer.offeredBy,
    proposedBudget: offer.proposedBudget,
    proposedChanges: [offer.swapFrom, offer.swapTo].filter(Boolean).join(' → '),
    message: offer.message,
    createdAt: offer.createdAt,
  }));

  const deal = existingDeal
    ? existingDeal
    : await Deal.create({
        eventId: proposal.eventId,
        organizerId: proposal.organizerId,
        sponsorId: proposal.sponsorId,
        tierId: proposal.selectedTierId,
        status: 'accepted',
        counterOffers: mappedCounters,
        finalAgreedBudget: proposal.proposedBudget,
        finalTierId: proposal.selectedTierId,
        acceptedAt: new Date(),
      });

  if (existingDeal) {
    existingDeal.status = 'accepted';
    existingDeal.finalAgreedBudget = proposal.proposedBudget;
    existingDeal.acceptedAt = existingDeal.acceptedAt || new Date();
    await existingDeal.save();
  }

  const existingCampaign = await Campaign.findOne({ dealId: deal._id });
  if (existingCampaign) return { deal, campaign: existingCampaign };

  const event = await Event.findById(proposal.eventId);
  const campaign = await Campaign.create({
    sponsorId: proposal.sponsorId,
    eventId: proposal.eventId,
    dealId: deal._id,
    spend: proposal.proposedBudget || 0,
    status: campaignStatusFromEventDate(event?.date),
    healthIndicator: 'green',
    goals: proposal.goals
      ? [{ metric: proposal.goals, targetValue: 1, currentValue: 0 }]
      : [],
  });

  return { deal, campaign };
};

// @desc    Inbox of proposals sent to the logged-in sponsor
// @route   GET /api/proposals/inbox
// @access  Private (Sponsor)
exports.getInbox = async (req, res) => {
  try {
    const proposals = await Proposal.find({
      sponsorId: req.user._id,
      status: { $ne: 'drafted' },
    })
      .populate(POPULATE)
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: proposals.length,
      data: proposals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proposal inbox',
      error: error.message,
    });
  }
};

// @desc    Submit a counter-offer (budget and/or package item swap)
// @route   POST /api/proposals/:proposalId/counter-offer
// @access  Private (assigned sponsor or owner organizer)
exports.counterOffer = async (req, res) => {
  try {
    const { proposal, error } = await findAccessibleProposal(req.params.proposalId, req.user);
    if (error) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }

    if (!NEGOTIABLE_STATUSES.includes(proposal.status)) {
      return res.status(400).json({
        success: false,
        message: 'This proposal is not open for negotiation',
      });
    }

    const { proposedBudget, swapFrom, swapTo, message } = req.body;
    const hasBudget = proposedBudget !== undefined && proposedBudget !== null && proposedBudget !== '';
    const hasSwap = Boolean(swapFrom || swapTo);

    if (!hasBudget && !hasSwap && !message) {
      return res.status(400).json({
        success: false,
        message: 'Provide a proposed budget, a package swap, or a message',
      });
    }

    if (hasSwap && (!swapFrom || !swapTo)) {
      return res.status(400).json({
        success: false,
        message: 'A swap needs both the item to replace and the item to add',
      });
    }

    proposal.counterOffers.push({
      offeredBy: req.user._id,
      role: req.user.role === 'organizer' ? 'organizer' : 'sponsor',
      proposedBudget: hasBudget ? Number(proposedBudget) : proposal.proposedBudget,
      swapFrom: swapFrom || '',
      swapTo: swapTo || '',
      message: message || '',
      status: 'pending',
    });
    proposal.status = 'negotiation';
    await proposal.save();

    const populated = await Proposal.findById(proposal._id).populate(POPULATE);

    res.status(201).json({
      success: true,
      message: 'Counter-offer submitted',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit counter-offer',
      error: error.message,
    });
  }
};

// @desc    Accept current terms or the latest pending counter-offer
// @route   POST /api/proposals/:proposalId/accept
// @access  Private (assigned sponsor or owner organizer)
exports.acceptProposal = async (req, res) => {
  try {
    const { proposal, isOwner, isAssignedSponsor, error } = await findAccessibleProposal(
      req.params.proposalId,
      req.user
    );
    if (error) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }

    if (['accepted', 'rejected', 'drafted'].includes(proposal.status)) {
      return res.status(400).json({
        success: false,
        message: 'This proposal cannot be accepted in its current status',
      });
    }

    const pending = latestPendingCounter(proposal);
    if (pending) {
      if (pending.offeredBy.toString() === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Wait for the other party to respond to your counter-offer',
        });
      }
      pending.status = 'accepted';
      if (pending.proposedBudget !== undefined && pending.proposedBudget !== null) {
        proposal.proposedBudget = pending.proposedBudget;
      }
    } else if (!isAssignedSponsor && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'You cannot accept this proposal',
      });
    }

    proposal.status = 'accepted';
    proposal.respondedAt = new Date();
    await proposal.save();

    await finalizeAcceptedDeal(proposal);

    const populated = await Proposal.findById(proposal._id).populate(POPULATE);

    res.status(200).json({
      success: true,
      message: 'Proposal accepted',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to accept proposal',
      error: error.message,
    });
  }
};

// @desc    Reject the proposal or the latest pending counter-offer
// @route   POST /api/proposals/:proposalId/reject
// @access  Private (assigned sponsor or owner organizer)
exports.rejectProposal = async (req, res) => {
  try {
    const { proposal, error } = await findAccessibleProposal(req.params.proposalId, req.user);
    if (error) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }

    if (['accepted', 'rejected', 'drafted'].includes(proposal.status)) {
      return res.status(400).json({
        success: false,
        message: 'This proposal cannot be rejected in its current status',
      });
    }

    const pending = latestPendingCounter(proposal);
    if (pending) {
      if (pending.offeredBy.toString() === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Wait for the other party to respond to your counter-offer',
        });
      }
      pending.status = 'rejected';
    }

    proposal.status = 'rejected';
    proposal.respondedAt = new Date();
    await proposal.save();

    const populated = await Proposal.findById(proposal._id).populate(POPULATE);

    res.status(200).json({
      success: true,
      message: 'Proposal rejected',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject proposal',
      error: error.message,
    });
  }
};
// ========== MODULE 2 | Feature 2: Proposal Review & In-Platform Negotiation — END ==========

// ========== MODULE 2 | Feature 4: Proposal Status Tracker — START ==========
const PIPELINE_COLUMNS = ['drafted', 'sent', 'viewed', 'negotiation', 'accepted', 'rejected'];

// @desc    Organizer visual pipeline of proposal statuses
// @route   GET /api/proposals/pipeline
// @access  Private (Organizer)
exports.getPipeline = async (req, res) => {
  try {
    const proposals = await Proposal.find({ organizerId: req.user._id })
      .populate(POPULATE)
      .sort({ updatedAt: -1 });

    const columns = {};
    const counts = {};
    PIPELINE_COLUMNS.forEach((status) => {
      columns[status] = [];
      counts[status] = 0;
    });

    proposals.forEach((proposal) => {
      const status = PIPELINE_COLUMNS.includes(proposal.status) ? proposal.status : 'drafted';
      columns[status].push(proposal);
      counts[status] += 1;
    });

    res.status(200).json({
      success: true,
      count: proposals.length,
      data: { columns, counts },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch proposal pipeline',
      error: error.message,
    });
  }
};
// ========== MODULE 2 | Feature 4: Proposal Status Tracker — END ==========
