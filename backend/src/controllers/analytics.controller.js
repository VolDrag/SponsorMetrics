const PostEventMetrics = require('../models/PostEventMetrics');
const Proposal = require('../models/Proposal');
const Event = require('../models/Event');

// ===== MODULE 3 FEATURE 2: Sponsorship Performance & ROI Analytics — START =====
const safeDivide = (numerator, denominator) => {
  const n = Number(numerator);
  const d = Number(denominator);
  if (!d || !Number.isFinite(n) || !Number.isFinite(d)) return null;
  return Math.round((n / d) * 100) / 100;
};

const average = (values) => {
  const nums = values.filter((value) => value !== null && value !== undefined && Number.isFinite(Number(value)));
  if (!nums.length) return null;
  return Math.round((nums.reduce((sum, value) => sum + Number(value), 0) / nums.length) * 100) / 100;
};

const eventEnded = (event) => {
  if (!event?.date) return false;
  const end = new Date(event.date);
  end.setHours(23, 59, 59, 999);
  return end < new Date();
};

exports.computeKpis = (row) => {
  const sponsorshipCost = Number(row.sponsorshipCost || 0);
  return {
    costPerReach: safeDivide(sponsorshipCost, row.totalReach),
    costPerEngagement: safeDivide(sponsorshipCost, row.totalEngagement),
  };
};

exports.buildRoiPayload = (rows) => {
  const ordered = [...rows].sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

  const withGrowth = ordered.map((row, index) => {
    const previous = index > 0 ? ordered[index - 1] : null;
    let audienceGrowth = null;
    if (previous && Number(previous.attendeeCount) > 0) {
      audienceGrowth =
        Math.round(
          ((Number(row.attendeeCount) - Number(previous.attendeeCount)) / Number(previous.attendeeCount)) * 10000
        ) / 100;
    }
    const kpis = exports.computeKpis(row);
    return { ...row, ...kpis, audienceGrowth };
  });

  const overallAverages = {
    costPerReach: average(withGrowth.map((row) => row.costPerReach)),
    costPerEngagement: average(withGrowth.map((row) => row.costPerEngagement)),
    audienceGrowth: average(withGrowth.map((row) => row.audienceGrowth)),
  };

  const events = withGrowth.map((row, index) => {
    const others = withGrowth.filter((_, otherIndex) => otherIndex !== index);
    return {
      ...row,
      benchmarks: {
        costPerReach: average(others.map((item) => item.costPerReach)),
        costPerEngagement: average(others.map((item) => item.costPerEngagement)),
        audienceGrowth: average(others.map((item) => item.audienceGrowth)),
      },
    };
  });

  return { events, averages: overallAverages };
};

// @desc    Organizer submits post-event reach / engagement / attendance
// @route   POST /api/analytics/metrics
// @access  Private (Organizer)
exports.submitMetrics = async (req, res) => {
  try {
    const { proposalId, totalReach, totalEngagement, attendeeCount } = req.body;
    const proposal = await Proposal.findById(proposalId).populate('eventId');

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    if (String(proposal.organizerId) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Only the event organizer can submit post-event metrics',
      });
    }

    if (proposal.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Metrics can only be submitted for an accepted sponsorship',
      });
    }

    if (!eventEnded(proposal.eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Wait until the event end date has passed before submitting metrics',
      });
    }

    const payload = {
      eventId: proposal.eventId._id,
      proposalId: proposal._id,
      totalReach: Number(totalReach),
      totalEngagement: Number(totalEngagement),
      attendeeCount: Number(attendeeCount),
      submittedAt: new Date(),
    };

    const metrics = await PostEventMetrics.findOneAndUpdate(
      { proposalId: proposal._id },
      payload,
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Post-event metrics saved',
      data: metrics,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save post-event metrics',
      error: error.message,
    });
  }
};

// @desc    Accepted proposals for an event, plus any submitted metrics
// @route   GET /api/analytics/events/:eventId/metrics
// @access  Private (Organizer owner)
exports.getEventMetrics = async (req, res) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId, organizerId: req.user._id });
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or you do not have permission',
      });
    }

    const proposals = await Proposal.find({
      eventId: event._id,
      organizerId: req.user._id,
      status: 'accepted',
    })
      .populate('sponsorId', 'name organizationName')
      .populate('selectedTierId', 'name price')
      .sort({ updatedAt: -1 });

    const metrics = await PostEventMetrics.find({ eventId: event._id });
    const byProposal = {};
    metrics.forEach((row) => {
      byProposal[String(row.proposalId)] = row;
    });

    const data = proposals.map((proposal) => ({
      proposal,
      metrics: byProposal[String(proposal._id)] || null,
      eventEnded: eventEnded(event),
    }));

    res.status(200).json({
      success: true,
      data: { event, rows: data },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch event metrics',
      error: error.message,
    });
  }
};

// @desc    Per-event KPIs plus historical averages for a sponsor
// @route   GET /api/analytics/roi/:sponsorId
// @access  Private (that sponsor, or admin)
exports.getSponsorRoi = async (req, res) => {
  try {
    const { sponsorId } = req.params;
    const isSelf = String(req.user._id) === String(sponsorId);
    if (!isSelf && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own ROI analytics',
      });
    }

    const proposals = await Proposal.find({
      sponsorId,
      status: 'accepted',
    })
      .populate('eventId', 'name date venue expectedCrowdSize')
      .populate('organizerId', 'name organizationName');

    const metrics = await PostEventMetrics.find({
      proposalId: { $in: proposals.map((proposal) => proposal._id) },
    });
    const metricsByProposal = {};
    metrics.forEach((row) => {
      metricsByProposal[String(row.proposalId)] = row;
    });

    const rows = proposals
      .filter((proposal) => metricsByProposal[String(proposal._id)])
      .map((proposal) => {
        const metric = metricsByProposal[String(proposal._id)];
        return {
          proposalId: proposal._id,
          eventId: proposal.eventId?._id || proposal.eventId,
          eventName: proposal.eventId?.name || 'Event',
          eventDate: proposal.eventId?.date,
          venue: proposal.eventId?.venue,
          organizerName: proposal.organizerId?.organizationName || proposal.organizerId?.name,
          sponsorshipCost: Number(proposal.proposedBudget || 0),
          totalReach: metric.totalReach,
          totalEngagement: metric.totalEngagement,
          attendeeCount: metric.attendeeCount,
          submittedAt: metric.submittedAt,
        };
      });

    const payload = exports.buildRoiPayload(rows);

    res.status(200).json({
      success: true,
      data: payload,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to compute ROI analytics',
      error: error.message,
    });
  }
};
// ===== MODULE 3 FEATURE 2: Sponsorship Performance & ROI Analytics — END =====
