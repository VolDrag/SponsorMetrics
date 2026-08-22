const Campaign = require('../models/Campaign');
const Event = require('../models/Event');
const Proposal = require('../models/Proposal');
const Deal = require('../models/Deal');

// MODULE 2 | Feature 3: Sponsor Portfolio Handler
const POPULATE = [
  { path: 'eventId', select: 'name venue date expectedCrowdSize status' },
  { path: 'dealId', select: 'status finalAgreedBudget tierId' },
];

const deriveStatusFromEvent = (eventDate) => {
  if (!eventDate) return 'upcoming';
  const now = new Date();
  const date = new Date(eventDate);
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  if (now > end) return 'completed';
  const weekBefore = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (now >= weekBefore) return 'active';
  return 'upcoming';
};

const deriveHealth = (status, spend, eventDate, eventReport) => {
  const now = new Date();
  if (eventDate && new Date(eventDate) < now && status !== 'completed') {
    return 'red';
  }
  if (status === 'completed') {
    // MODULE 2 | Feature 3 Event Editing: completed + saved report → green
    if (eventReport?.submittedAt) return 'green';
    return Number(spend) > 0 ? 'yellow' : 'red';
  }
  if (status === 'active') {
    return 'yellow';
  }
  return 'green';
};

// ========== MODULE 2 | Feature 3 Event Editing — START ==========
const toNumber = (value, fallback = 0) => {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseExistingPhotos = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string');
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
};
// ========== MODULE 2 | Feature 3 Event Editing helpers — END ==========

const refreshCampaign = async (campaign) => {
  const eventDate = campaign.eventId?.date;
  const nextHealth = deriveHealth(
    campaign.status,
    campaign.spend,
    eventDate,
    campaign.eventReport
  );
  if (campaign.healthIndicator !== nextHealth) {
    campaign.healthIndicator = nextHealth;
    await campaign.save();
  }
  return campaign;
};

const backfillFromAcceptedProposals = async (sponsorId) => {
  const accepted = await Proposal.find({
    sponsorId,
    status: 'accepted',
  });

  for (const proposal of accepted) {
    const exists = await Campaign.findOne({
      sponsorId,
      eventId: proposal.eventId,
    });
    if (exists) continue;

    let deal = await Deal.findOne({
      eventId: proposal.eventId,
      sponsorId,
      organizerId: proposal.organizerId,
    });

    if (!deal) {
      deal = await Deal.create({
        eventId: proposal.eventId,
        organizerId: proposal.organizerId,
        sponsorId,
        tierId: proposal.selectedTierId,
        status: 'accepted',
        finalAgreedBudget: proposal.proposedBudget,
        finalTierId: proposal.selectedTierId,
        acceptedAt: proposal.respondedAt || new Date(),
      });
    }

    const event = await Event.findById(proposal.eventId);
    await Campaign.create({
      sponsorId,
      eventId: proposal.eventId,
      dealId: deal._id,
      spend: proposal.proposedBudget || 0,
      status: deriveStatusFromEvent(event?.date),
      healthIndicator: 'green',
      goals: proposal.goals
        ? [{ metric: proposal.goals, targetValue: 1, currentValue: 0 }]
        : [],
    });
  }
};

// @desc    Sponsor portfolio of sponsored events
// @route   GET /api/campaigns/my-portfolio
// @access  Private (Sponsor)
// MODULE 2 | Feature 3: Sponsor Portfolio Handler
exports.getMyPortfolio = async (req, res) => {
  try {
    await backfillFromAcceptedProposals(req.user._id);

    const campaigns = await Campaign.find({ sponsorId: req.user._id })
      .populate(POPULATE)
      .sort({ updatedAt: -1 });

    for (const campaign of campaigns) {
      await refreshCampaign(campaign);
    }

    const refreshed = await Campaign.find({ sponsorId: req.user._id })
      .populate(POPULATE)
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: refreshed.length,
      data: refreshed,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch portfolio',
      error: error.message,
    });
  }
};

// @desc    Get one campaign card
// @route   GET /api/campaigns/:campaignId
// @access  Private (Sponsor owner)
exports.getCampaignById = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.campaignId,
      sponsorId: req.user._id,
    }).populate(POPULATE);

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found',
      });
    }

    await refreshCampaign(campaign);
    const refreshed = await Campaign.findById(campaign._id).populate(POPULATE);

    res.status(200).json({
      success: true,
      data: refreshed,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch campaign',
      error: error.message,
    });
  }
};

// @desc    Manage a portfolio card (status / spend)
// @route   PUT /api/campaigns/:campaignId
// @access  Private (Sponsor owner)
// MODULE 2 | Feature 3: Sponsor Portfolio Handler
exports.updateCampaign = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.campaignId,
      sponsorId: req.user._id,
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found or you do not have permission',
      });
    }

    if (req.body.status !== undefined) {
      campaign.status = req.body.status;
    }
    if (req.body.spend !== undefined) {
      campaign.spend = Number(req.body.spend);
    }
    if (req.body.healthIndicator !== undefined) {
      campaign.healthIndicator = req.body.healthIndicator;
    }

    const event = await Event.findById(campaign.eventId);
    if (req.body.healthIndicator === undefined) {
      campaign.healthIndicator = deriveHealth(
        campaign.status,
        campaign.spend,
        event?.date,
        campaign.eventReport
      );
    }

    await campaign.save();
    const populated = await Campaign.findById(campaign._id).populate(POPULATE);

    res.status(200).json({
      success: true,
      message: 'Campaign updated successfully',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update campaign',
      error: error.message,
    });
  }
};

// ========== MODULE 2 | Feature 3 Event Editing: post-event report on completed cards — START ==========
// @desc    Add/update post-event report on a completed portfolio card
// @route   PUT /api/campaigns/:campaignId/event-report
// @access  Private (Sponsor owner, completed campaigns only)
exports.updateEventReport = async (req, res) => {
  try {
    const campaign = await Campaign.findOne({
      _id: req.params.campaignId,
      sponsorId: req.user._id,
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found or you do not have permission',
      });
    }

    if (campaign.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Event reports can only be edited for completed sponsorships',
      });
    }

    const current = campaign.eventReport || {};
    const reach = toNumber(req.body.reach, current.reach || 0);
    const engagement = toNumber(req.body.engagement, current.engagement || 0);
    const spend = campaign.spend || 0;

    const keptPhotos = parseExistingPhotos(req.body.existingPhotos);
    const uploaded = (req.files || []).map((file) => `/uploads/campaigns/${file.filename}`);

    campaign.eventReport = {
      reach,
      engagement,
      leads: toNumber(req.body.leads, current.leads || 0),
      conversions: toNumber(req.body.conversions, current.conversions || 0),
      likes: toNumber(req.body.likes, current.likes || 0),
      shares: toNumber(req.body.shares, current.shares || 0),
      attendance: toNumber(req.body.attendance, current.attendance || 0),
      audienceGrowth: toNumber(req.body.audienceGrowth, current.audienceGrowth || 0),
      revenue: toNumber(req.body.revenue, current.revenue || 0),
      profit: toNumber(req.body.profit, current.profit || 0),
      costPerReach: reach > 0 ? Number((spend / reach).toFixed(4)) : undefined,
      costPerEngagement: engagement > 0 ? Number((spend / engagement).toFixed(4)) : undefined,
      photos: [...keptPhotos, ...uploaded],
      submittedAt: new Date(),
    };

    const event = await Event.findById(campaign.eventId);
    campaign.healthIndicator = deriveHealth(
      campaign.status,
      campaign.spend,
      event?.date,
      campaign.eventReport
    );

    await campaign.save();
    const populated = await Campaign.findById(campaign._id).populate(POPULATE);

    res.status(200).json({
      success: true,
      message: 'Event report saved',
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save event report',
      error: error.message,
    });
  }
};
// ========== MODULE 2 | Feature 3 Event Editing — END ==========
