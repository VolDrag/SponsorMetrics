const mongoose = require('mongoose');
const Review = require('../models/Review');
const Proposal = require('../models/Proposal');
const Deal = require('../models/Deal');
const User = require('../models/User');
const Notification = require('../models/Notification');
const PostEventMetrics = require('../models/PostEventMetrics');

// ===== MODULE 3 FEATURE 1: Mutual Review & Rating System — START =====
const POPULATE = [
  { path: 'reviewerId', select: 'name organizationName role profilePicture' },
  { path: 'revieweeId', select: 'name organizationName role' },
  { path: 'proposalId', select: 'eventId status proposedBudget organizerId sponsorId' },
];

const roundScore = (value) => Math.round(Number(value || 0) * 10) / 10;

// Rewired in Module 4 Feature 2: reviews open when the post-event report is Approved.
const isDealClosedForReview = async (proposal) => {
  if (!proposal || proposal.status !== 'accepted') return false;
  const report = await PostEventMetrics.findOne({ proposalId: proposal._id }).select('status');
  return report?.status === 'Approved';
};

const refreshUserScores = async (userId) => {
  const agg = await Review.aggregate([
    { $match: { revieweeId: new mongoose.Types.ObjectId(String(userId)) } },
    {
      $group: {
        _id: '$revieweeId',
        avgReliability: { $avg: '$reliabilityScore' },
        avgCommunication: { $avg: '$communicationScore' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const stats = agg[0] || { avgReliability: 0, avgCommunication: 0, reviewCount: 0 };
  const credibilityScore = stats.reviewCount
    ? roundScore((stats.avgReliability + stats.avgCommunication) / 2)
    : 0;

  await User.findByIdAndUpdate(userId, {
    avgReliability: roundScore(stats.avgReliability),
    avgCommunication: roundScore(stats.avgCommunication),
    reviewCount: stats.reviewCount,
    credibilityScore,
  });

  return {
    avgReliability: roundScore(stats.avgReliability),
    avgCommunication: roundScore(stats.avgCommunication),
    reviewCount: stats.reviewCount,
    credibilityScore,
  };
};

const counterpartId = (proposal, userId) => {
  const organizerId = proposal.organizerId?._id || proposal.organizerId;
  const sponsorId = proposal.sponsorId?._id || proposal.sponsorId;
  if (String(organizerId) === String(userId)) return sponsorId;
  if (String(sponsorId) === String(userId)) return organizerId;
  return null;
};

// @desc    Deals the current user can still rate
// @route   GET /api/reviews/pending
// @access  Private
exports.getPendingReviews = async (req, res) => {
  try {
    const userId = req.user._id;
    const proposals = await Proposal.find({
      status: 'accepted',
      $or: [{ organizerId: userId }, { sponsorId: userId }],
    })
      .populate('eventId', 'name date venue')
      .populate('organizerId', 'name organizationName')
      .populate('sponsorId', 'name organizationName')
      .sort({ respondedAt: -1, updatedAt: -1 });

    const alreadyReviewed = await Review.find({ reviewerId: userId }).select('proposalId');
    const reviewedIds = new Set(alreadyReviewed.map((row) => String(row.proposalId)));

    const pending = [];
    for (const proposal of proposals) {
      if (reviewedIds.has(String(proposal._id))) continue;
      if (await isDealClosedForReview(proposal)) pending.push(proposal);
    }

    res.status(200).json({
      success: true,
      count: pending.length,
      data: pending,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending reviews',
      error: error.message,
    });
  }
};

// @desc    Submit a mutual review for a closed deal (once per party)
// @route   POST /api/reviews
// @access  Private (organizer or sponsor on the deal)
exports.createReview = async (req, res) => {
  try {
    const { proposalId, reliabilityScore, communicationScore, comment } = req.body;
    const proposal = await Proposal.findById(proposalId).populate('eventId', 'name date');

    if (!proposal) {
      return res.status(404).json({ success: false, message: 'Proposal not found' });
    }

    const userId = String(req.user._id);
    const organizerId = String(proposal.organizerId);
    const sponsorId = proposal.sponsorId ? String(proposal.sponsorId) : null;
    const isParty = userId === organizerId || userId === sponsorId;

    if (!isParty) {
      return res.status(403).json({
        success: false,
        message: 'Only the organizer and sponsor on this deal can leave a review',
      });
    }

    if (!(await isDealClosedForReview(proposal))) {
      return res.status(400).json({
        success: false,
        message: 'Reviews open after the sponsor approves the post-event report',
      });
    }

    const revieweeId = counterpartId(proposal, userId);
    if (!revieweeId) {
      return res.status(400).json({
        success: false,
        message: 'This deal does not have a counterpart to review',
      });
    }

    const existing = await Review.findOne({ proposalId: proposal._id, reviewerId: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this deal',
      });
    }

    const deal = await Deal.findOne({
      eventId: proposal.eventId?._id || proposal.eventId,
      organizerId: proposal.organizerId,
      sponsorId: proposal.sponsorId,
      status: 'accepted',
    });

    const review = await Review.create({
      dealId: deal?._id,
      proposalId: proposal._id,
      reviewerId: req.user._id,
      revieweeId,
      reliabilityScore: Number(reliabilityScore),
      communicationScore: Number(communicationScore),
      comment: comment || '',
    });

    const scores = await refreshUserScores(revieweeId);

    await Notification.create({
      userId: revieweeId,
      type: 'review_prompt',
      message: `${req.user.organizationName || req.user.name} rated your deal${proposal.eventId?.name ? ` for ${proposal.eventId.name}` : ''}.`,
      relatedId: review._id,
    }).catch(() => {});

    const populated = await Review.findById(review._id).populate(POPULATE);

    res.status(201).json({
      success: true,
      message: 'Review submitted',
      data: { review: populated, scores },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this deal',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to submit review',
      error: error.message,
    });
  }
};

// @desc    Public credibility scores and received reviews for a user
// @route   GET /api/reviews/user/:userId
// @access  Private
exports.getUserReviews = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select(
      'name organizationName organizationType industry budgetTier role isVerified credibilityScore avgReliability avgCommunication reviewCount profilePicture'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const reviews = await Review.find({ revieweeId: user._id })
      .populate(POPULATE)
      .sort({ createdAt: -1 });

    const liveScores = await refreshUserScores(user._id);

    res.status(200).json({
      success: true,
      data: {
        user,
        scores: liveScores,
        reviews,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reviews',
      error: error.message,
    });
  }
};
// ===== MODULE 3 FEATURE 1: Mutual Review & Rating System — END =====
