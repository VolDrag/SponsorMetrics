const Budget = require('../models/Budget');
const Proposal = require('../models/Proposal');
const User = require('../models/User');
const { sendOverspendAlert } = require('../services/email.service');

// ===== MODULE 3 FEATURE 3: Budget Pacing & Overspend Alert System — START =====
const MS_DAY = 24 * 60 * 60 * 1000;

const daysBetween = (start, end) =>
  Math.max(1, Math.ceil((new Date(end) - new Date(start)) / MS_DAY));

const round2 = (value) => Math.round(Number(value || 0) * 100) / 100;

const committedSpendForPeriod = async (sponsorId, periodStart, periodEnd) => {
  const proposals = await Proposal.find({
    sponsorId,
    status: 'accepted',
  }).populate('eventId', 'date');

  return proposals.reduce((sum, proposal) => {
    const eventDate = proposal.eventId?.date;
    if (!eventDate) return sum;
    const date = new Date(eventDate);
    if (date < new Date(periodStart) || date > new Date(periodEnd)) return sum;
    return sum + Number(proposal.proposedBudget || 0);
  }, 0);
};

const buildPacing = async (budget) => {
  const now = new Date();
  const start = new Date(budget.periodStart);
  const end = new Date(budget.periodEnd);
  const totalDaysInPeriod = daysBetween(start, end);
  const committedSpend = await committedSpendForPeriod(budget.sponsorId, start, end);

  let daysElapsed = 0;
  if (now <= start) daysElapsed = 0;
  else if (now >= end) daysElapsed = totalDaysInPeriod;
  else daysElapsed = Math.max(1, Math.ceil((now - start) / MS_DAY));

  const dailyBurnRate = daysElapsed > 0 ? committedSpend / daysElapsed : 0;
  const projectedTotalSpend = dailyBurnRate * totalDaysInPeriod;
  const budgetAmount = Number(budget.budgetAmount || 0);
  const overspendPercent =
    budgetAmount > 0
      ? round2(((projectedTotalSpend - budgetAmount) / budgetAmount) * 100)
      : 0;

  return {
    budgetId: budget._id,
    periodType: budget.periodType,
    periodStart: budget.periodStart,
    periodEnd: budget.periodEnd,
    budgetAmount,
    committedSpend: round2(committedSpend),
    daysElapsed,
    totalDaysInPeriod,
    dailyBurnRate: round2(dailyBurnRate),
    projectedTotalSpend: round2(projectedTotalSpend),
    overspendPercent,
    lastAlertSentAt: budget.lastAlertSentAt,
    status:
      overspendPercent > 10 ? 'red' : overspendPercent > 0 ? 'yellow' : 'green',
  };
};

// Optional future enhancement: node-cron nightly job to recalculate all sponsor budgets.
// Not implemented now — pacing is recalculated on dashboard load and after a proposal is accepted.
const maybeSendOverspendAlert = async (budget, pacing) => {
  if (pacing.overspendPercent <= 10) return pacing;
  if (budget.lastAlertSentAt) return pacing;

  const sponsor = await User.findById(budget.sponsorId).select('email name organizationName');
  if (!sponsor?.email) return pacing;

  try {
    await sendOverspendAlert(
      sponsor.email,
      sponsor.organizationName || sponsor.name,
      pacing
    );
    budget.lastAlertSentAt = new Date();
    await budget.save();
    pacing.lastAlertSentAt = budget.lastAlertSentAt;
  } catch (error) {
    console.error('Overspend alert email failed:', error.message);
  }

  return pacing;
};

exports.recalculateForSponsor = async (sponsorId) => {
  const budgets = await Budget.find({ sponsorId }).sort({ periodStart: -1 });
  const results = [];
  for (const budget of budgets) {
    const pacing = await buildPacing(budget);
    results.push(await maybeSendOverspendAlert(budget, pacing));
  }
  return results;
};

// @desc    List / recalculate current sponsor budgets
// @route   GET /api/budgets/pacing
// @access  Private (Sponsor)
exports.getPacing = async (req, res) => {
  try {
    const data = await exports.recalculateForSponsor(req.user._id);
    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to calculate budget pacing',
      error: error.message,
    });
  }
};

// @desc    Create or update a quarterly/annual budget
// @route   PUT /api/budgets
// @access  Private (Sponsor)
exports.upsertBudget = async (req, res) => {
  try {
    const { periodType, periodStart, periodEnd, budgetAmount } = req.body;
    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'Period end must be after period start',
      });
    }

    const budget = await Budget.findOneAndUpdate(
      { sponsorId: req.user._id, periodType, periodStart: start },
      {
        sponsorId: req.user._id,
        periodType,
        periodStart: start,
        periodEnd: end,
        budgetAmount: Number(budgetAmount),
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    const data = await exports.recalculateForSponsor(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Budget saved',
      data: { budget, pacing: data },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to save budget',
      error: error.message,
    });
  }
};

// @desc    List saved budget records
// @route   GET /api/budgets
// @access  Private (Sponsor)
exports.listBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ sponsorId: req.user._id }).sort({ periodStart: -1 });
    res.status(200).json({ success: true, count: budgets.length, data: budgets });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch budgets',
      error: error.message,
    });
  }
};
// ===== MODULE 3 FEATURE 3: Budget Pacing & Overspend Alert System — END =====
