const MatchService = require('../services/match.service');

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
    const matches = await MatchService.discoverSponsorsForEvent(eventId, { search, industryFilter, budgetFilter });
    res.status(200).json({
      success: true,
      data: matches,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to discover sponsors',
    });
  }
};
// Rafi end
