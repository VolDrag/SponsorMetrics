const MatchService = require('../services/match.service');
const Event = require('../models/Event');

// Rafi
exports.discoverEvents = async (req, res) => {
  try {
    const { search, dateFilter, budgetFilter } = req.query;
    const matches = await MatchService.discoverEventsForSponsor(req.user.id, { search, dateFilter, budgetFilter });
    res.status(200).json({
      success: true,
      data: matches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to discover events',
      error: error.message,
    });
  }
};
// Rafi end

// Rafi
exports.discoverSponsors = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { search, industryFilter, budgetFilter } = req.query;

    // Fix #2: Verify the requester owns this event before exposing sponsor data
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    if (event.organizerId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view matches for this event' });
    }

    const matches = await MatchService.discoverSponsorsForEvent(eventId, { search, industryFilter, budgetFilter });
    res.status(200).json({
      success: true,
      data: matches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to discover sponsors',
      error: error.message, // Fix #5: expose error for debugging
    });
  }
};
// Rafi end
