const Experiment = require('../models/Experiment');
const Proposal = require('../models/Proposal');
const PostEventMetrics = require('../models/PostEventMetrics');
const { buildRoiPayload } = require('./analytics.controller');

// ===== MODULE 3 FEATURE 4: A/B Experiment Tracker for Sponsorship Formats — START =====
const LOWER_IS_BETTER = new Set(['costPerReach', 'costPerEngagement']);

const metricValueForEvent = (eventRow, primaryMetric) => {
  if (primaryMetric === 'engagementRate') {
    if (!eventRow.totalReach) return null;
    return Math.round((Number(eventRow.totalEngagement) / Number(eventRow.totalReach)) * 10000) / 100;
  }
  const value = eventRow[primaryMetric];
  return value === undefined || value === null || Number.isNaN(Number(value)) ? null : Number(value);
};

const average = (values) => {
  const nums = values.filter((value) => value !== null && value !== undefined && Number.isFinite(value));
  if (!nums.length) return null;
  return Math.round((nums.reduce((sum, value) => sum + value, 0) / nums.length) * 100) / 100;
};

const loadSponsorEventMetrics = async (sponsorId) => {
  const proposals = await Proposal.find({ sponsorId, status: 'accepted' }).populate('eventId', 'name date venue');
  const metrics = await PostEventMetrics.find({
    proposalId: { $in: proposals.map((proposal) => proposal._id) },
  });
  const byProposal = {};
  metrics.forEach((row) => {
    byProposal[String(row.proposalId)] = row;
  });

  const rows = proposals
    .filter((proposal) => byProposal[String(proposal._id)])
    .map((proposal) => {
      const metric = byProposal[String(proposal._id)];
      return {
        proposalId: proposal._id,
        eventId: String(proposal.eventId?._id || proposal.eventId),
        eventName: proposal.eventId?.name || 'Event',
        eventDate: proposal.eventId?.date,
        formatType: proposal.formatType || 'other',
        sponsorshipCost: Number(proposal.proposedBudget || 0),
        totalReach: metric.totalReach,
        totalEngagement: metric.totalEngagement,
        attendeeCount: metric.attendeeCount,
      };
    });

  return buildRoiPayload(rows);
};

const scoreExperiment = (experiment, eventMetrics) => {
  const byEventId = {};
  (eventMetrics.events || []).forEach((row) => {
    byEventId[String(row.eventId)] = row;
  });

  const variantStats = (experiment.variants || []).map((variant) => {
    const values = (variant.taggedEventIds || [])
      .map((eventId) => metricValueForEvent(byEventId[String(eventId)] || {}, experiment.primaryMetric))
      .filter((value) => value !== null);
    return {
      _id: variant._id,
      label: variant.label,
      formatType: variant.formatType,
      taggedEventIds: variant.taggedEventIds,
      isControlMarked: Boolean(variant.isControl),
      eventCount: (variant.taggedEventIds || []).length,
      sampleSize: values.length,
      average: average(values),
    };
  });

  const markedControl = variantStats.find((variant) => variant.isControlMarked && variant.average !== null);
  const control =
    markedControl ||
    [...variantStats]
      .filter((variant) => variant.average !== null)
      .sort((a, b) => b.eventCount - a.eventCount || b.sampleSize - a.sampleSize)[0] ||
    null;

  const lowerIsBetter = LOWER_IS_BETTER.has(experiment.primaryMetric);

  const withLift = variantStats.map((variant) => {
    let liftPercent = null;
    if (control && variant.average !== null && control.average) {
      liftPercent = Math.round(((variant.average - control.average) / control.average) * 10000) / 100;
    }
    return {
      ...variant,
      isControl: Boolean(control && String(control._id) === String(variant._id)),
      liftPercent,
    };
  });

  const comparable = withLift.filter((variant) => variant.average !== null);
  let winnerId = null;
  if (comparable.length) {
    winnerId = [...comparable].sort((a, b) =>
      lowerIsBetter ? a.average - b.average : b.average - a.average
    )[0]._id;
  }

  return {
    experiment,
    primaryMetric: experiment.primaryMetric,
    metricDirection: lowerIsBetter ? 'lower_is_better' : 'higher_is_better',
    variants: withLift.map((variant) => ({
      ...variant,
      isWinner: Boolean(winnerId && String(winnerId) === String(variant._id)),
    })),
  };
};

// @desc    Events this sponsor can tag in an experiment
// @route   GET /api/experiments/events
// @access  Private (Sponsor)
exports.listTaggableEvents = async (req, res) => {
  try {
    const payload = await loadSponsorEventMetrics(req.user._id);
    const proposals = await Proposal.find({ sponsorId: req.user._id, status: 'accepted' })
      .populate('eventId', 'name date venue')
      .sort({ updatedAt: -1 });

    const measuredIds = new Set((payload.events || []).map((row) => String(row.eventId)));
    const data = proposals
      .filter((proposal) => proposal.eventId)
      .map((proposal) => ({
        eventId: proposal.eventId._id,
        eventName: proposal.eventId.name,
        eventDate: proposal.eventId.date,
        formatType: proposal.formatType || 'other',
        hasMetrics: measuredIds.has(String(proposal.eventId._id)),
      }));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch experiment events',
      error: error.message,
    });
  }
};

// @desc    Create an A/B format experiment
// @route   POST /api/experiments
// @access  Private (Sponsor)
exports.createExperiment = async (req, res) => {
  try {
    const experiment = await Experiment.create({
      sponsorId: req.user._id,
      name: req.body.name,
      primaryMetric: req.body.primaryMetric,
      variants: req.body.variants,
    });

    const metrics = await loadSponsorEventMetrics(req.user._id);
    res.status(201).json({
      success: true,
      message: 'Experiment created',
      data: scoreExperiment(experiment, metrics),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create experiment',
      error: error.message,
    });
  }
};

// @desc    List sponsor experiments with lift results
// @route   GET /api/experiments
// @access  Private (Sponsor)
exports.listExperiments = async (req, res) => {
  try {
    const experiments = await Experiment.find({ sponsorId: req.user._id }).sort({ createdAt: -1 });
    const metrics = await loadSponsorEventMetrics(req.user._id);
    res.status(200).json({
      success: true,
      count: experiments.length,
      data: experiments.map((experiment) => scoreExperiment(experiment, metrics)),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch experiments',
      error: error.message,
    });
  }
};

// @desc    Single experiment results
// @route   GET /api/experiments/:experimentId
// @access  Private (Sponsor)
exports.getExperiment = async (req, res) => {
  try {
    const experiment = await Experiment.findOne({
      _id: req.params.experimentId,
      sponsorId: req.user._id,
    });
    if (!experiment) {
      return res.status(404).json({ success: false, message: 'Experiment not found' });
    }
    const metrics = await loadSponsorEventMetrics(req.user._id);
    res.status(200).json({
      success: true,
      data: scoreExperiment(experiment, metrics),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch experiment',
      error: error.message,
    });
  }
};
// ===== MODULE 3 FEATURE 4: A/B Experiment Tracker for Sponsorship Formats — END =====
