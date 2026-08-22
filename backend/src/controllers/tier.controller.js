// ifty
const mongoose = require('mongoose');

const Event = require('../models/Event');
const SponsorshipTier = require('../models/SponsorshipTier');
const benefitPresets = require('../utils/benefitPresets');

const presetLabels = new Set(benefitPresets.map((preset) => preset.label));

const normalizeBenefits = (benefits) => {
  if (!Array.isArray(benefits)) {
    return [];
  }

  return benefits
    .filter(
      (benefit) =>
        benefit &&
        typeof benefit.label === 'string' &&
        benefit.label.trim() &&
        typeof benefit.detail === 'string' &&
        benefit.detail.trim()
    )
    .map((benefit) => {
      const normalizedLabel = benefit.label.trim();
      const normalizedDetail = benefit.detail.trim();

      if (presetLabels.has(normalizedLabel)) {
        return {
          label: normalizedLabel,
          detail: normalizedDetail,
        };
      }

      return {
        label: normalizedLabel,
        detail: normalizedDetail,
      };
    });
};

const inferFormatType = (benefits = [], explicit) => {
  const allowed = ['banner', 'booth', 'speaking_slot', 'social_post', 'other'];
  if (allowed.includes(explicit)) return explicit;
  const labels = benefits.map((benefit) => String(benefit.label || '').toLowerCase()).join(' ');
  if (labels.includes('booth')) return 'booth';
  if (labels.includes('speaking')) return 'speaking_slot';
  if (labels.includes('facebook') || labels.includes('social')) return 'social_post';
  if (labels.includes('banner')) return 'banner';
  return 'other';
};

const createTier = async (req, res) => {
  try {
    const { eventId, name, price, isCustom, benefits, formatType } = req.body;
    const normalizedName = String(name || '').trim();
    const normalizedPrice = Number(price);

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid eventId.' });
    }

    if (!normalizedName) {
      return res.status(400).json({ message: 'Tier name is required.' });
    }

    if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
      return res.status(400).json({ message: 'Price must be a valid non-negative number.' });
    }

    const event = await Event.findOne({ _id: eventId, organizerId: req.user._id });
    if (!event) {
      return res.status(403).json({ message: 'You can only create tiers for your own events.' });
    }

    const normalizedBenefits = normalizeBenefits(benefits);
    const tier = await SponsorshipTier.create({
      eventId,
      name: normalizedName,
      price: normalizedPrice,
      isCustom: Boolean(isCustom),
      benefits: normalizedBenefits,
      // ===== MODULE 3 FEATURE 4: A/B Experiment Tracker — START =====
      formatType: inferFormatType(normalizedBenefits, formatType),
      // ===== MODULE 3 FEATURE 4: A/B Experiment Tracker — END =====
    });

    return res.status(201).json({ tier });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create tier.', error: error.message });
  }
};

const getTiersByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ message: 'Invalid eventId.' });
    }

    const tiers = await SponsorshipTier.find({ eventId }).sort({ createdAt: 1 });
    return res.status(200).json({ tiers });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch tiers.', error: error.message });
  }
};

const updateTier = async (req, res) => {
  try {
    const { tierId } = req.params;
    const { name, price, isCustom, benefits, formatType } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tierId)) {
      return res.status(400).json({ message: 'Invalid tierId.' });
    }

    const tier = await SponsorshipTier.findById(tierId);
    if (!tier) {
      return res.status(404).json({ message: 'Tier not found.' });
    }

    const event = await Event.findOne({ _id: tier.eventId, organizerId: req.user._id });
    if (!event) {
      return res.status(403).json({ message: 'You can only update tiers for your own events.' });
    }

    if (name !== undefined) {
      const normalizedName = String(name).trim();
      if (!normalizedName) {
        return res.status(400).json({ message: 'Tier name cannot be empty.' });
      }
      tier.name = normalizedName;
    }
    if (price !== undefined) {
      const normalizedPrice = Number(price);
      if (!Number.isFinite(normalizedPrice) || normalizedPrice < 0) {
        return res.status(400).json({ message: 'Price must be a valid non-negative number.' });
      }
      tier.price = normalizedPrice;
    }
    if (isCustom !== undefined) {
      tier.isCustom = Boolean(isCustom);
    }
    if (benefits !== undefined) {
      tier.benefits = normalizeBenefits(benefits);
    }
    // ===== MODULE 3 FEATURE 4: A/B Experiment Tracker — START =====
    if (formatType !== undefined || benefits !== undefined) {
      tier.formatType = inferFormatType(tier.benefits, formatType);
    }
    // ===== MODULE 3 FEATURE 4: A/B Experiment Tracker — END =====

    await tier.save();
    return res.status(200).json({ tier });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update tier.', error: error.message });
  }
};

const deleteTier = async (req, res) => {
  try {
    const { tierId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tierId)) {
      return res.status(400).json({ message: 'Invalid tierId.' });
    }

    const tier = await SponsorshipTier.findById(tierId);
    if (!tier) {
      return res.status(404).json({ message: 'Tier not found.' });
    }

    const event = await Event.findOne({ _id: tier.eventId, organizerId: req.user._id });
    if (!event) {
      return res.status(403).json({ message: 'You can only delete tiers for your own events.' });
    }

    await SponsorshipTier.deleteOne({ _id: tierId });
    return res.status(200).json({ message: 'Tier deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete tier.', error: error.message });
  }
};

const getOrganizerEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizerId: req.user._id }).sort({ date: -1 });
    return res.status(200).json({ events });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch organizer events.', error: error.message });
  }
};

module.exports = {
  createTier,
  getTiersByEvent,
  updateTier,
  deleteTier,
  getOrganizerEvents,
};
// ifty end
