const Event = require('../models/Event');
const User = require('../models/User');
const SponsorshipTier = require('../models/SponsorshipTier');
const Proposal = require('../models/Proposal');
const PostEventMetrics = require('../models/PostEventMetrics');
const { generateMarketingAdvice } = require('../services/gemini.service');

// ===== MODULE 4 FEATURE 4: AI-Powered Marketing Consultation — START =====
const buildContext = async (event, organizer) => {
  const tiers = await SponsorshipTier.find({ eventId: event._id }).select('name price');
  const prices = tiers.map((tier) => Number(tier.price || 0)).filter((price) => price > 0);
  const budgetRange = prices.length
    ? `BDT ${Math.min(...prices).toLocaleString()} – ${Math.max(...prices).toLocaleString()}`
    : '';

  const pastProposals = await Proposal.find({
    organizerId: event.organizerId,
    status: 'accepted',
  }).select('_id eventId proposedBudget');
  const pastMetrics = await PostEventMetrics.find({
    proposalId: { $in: pastProposals.map((row) => row._id) },
  }).select('totalReach totalEngagement attendeeCount');

  const pastPerformance = pastMetrics.length
    ? pastMetrics
        .map(
          (row) =>
            `reach ${row.totalReach}, engagement ${row.totalEngagement}, attendees ${row.attendeeCount}`
        )
        .join('; ')
    : '';

  return {
    eventName: event.name,
    venue: event.venue,
    date: event.date,
    organizerType: organizer?.organizationType || organizer?.industry,
    expectedCrowdSize: event.expectedCrowdSize,
    socialMediaReach: event.socialMediaReach,
    budgetRange,
    pastPerformance,
    pastReach: pastMetrics[0]?.totalReach,
  };
};

// @desc    Grounded marketing recommendations for an event
// @route   POST /api/marketing/events/:eventId
// @access  Private (Organizer owner)
exports.getEventAdvice = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId, organizerId: req.user._id });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or you do not have permission',
      });
    }

    const organizer = await User.findById(req.user._id).select('organizationType industry organizationName');
    const context = await buildContext(event, organizer);
    const result = await generateMarketingAdvice(context);

    res.status(200).json({
      success: true,
      message: result.source === 'gemini' ? 'Marketing advice generated' : 'Marketing advice generated (local fallback)',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to generate marketing advice',
      error: error.message,
    });
  }
};
// ===== MODULE 4 FEATURE 4: AI-Powered Marketing Consultation — END =====
