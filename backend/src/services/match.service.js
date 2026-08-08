const Event = require('../models/Event');
const User = require('../models/User');
const SponsorshipTier = require('../models/SponsorshipTier');

/**
 * AI-driven matching algorithm simulation.
 * Calculates a match score based on various criteria.
 */
class MatchService {
// Rafi
  static async discoverEventsForSponsor(sponsorId, filters = {}) {
    const { search, dateFilter, budgetFilter } = filters;
    const sponsor = await User.findById(sponsorId);
    if (!sponsor || sponsor.role !== 'sponsor') {
      throw new Error('Sponsor not found or invalid role');
    }

    const query = { status: 'published' };

    // 1. Search Filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { venue: { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Date Filter
    if (dateFilter === 'this_month') {
      const start = new Date();
      start.setDate(1);
      start.setHours(0,0,0,0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      query.date = { $gte: start, $lt: end };
    } else if (dateFilter === 'next_month') {
      const start = new Date();
      start.setMonth(start.getMonth() + 1);
      start.setDate(1);
      start.setHours(0,0,0,0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      query.date = { $gte: start, $lt: end };
    }

    // Fetch matching events
    let events = await Event.find(query).populate('organizerId', 'name organizationName');

    // 3. Budget Filter (Post-Query)
    if (budgetFilter && budgetFilter !== 'any') {
      // Find the minimum tier price for each event
      const eventIds = events.map(e => e._id);
      const tiers = await SponsorshipTier.find({ eventId: { $in: eventIds } });
      
      const minPriceByEventId = {};
      tiers.forEach(tier => {
        const id = tier.eventId.toString();
        if (!minPriceByEventId[id] || tier.price < minPriceByEventId[id]) {
          minPriceByEventId[id] = tier.price;
        }
      });

      events = events.filter(event => {
        const minPrice = minPriceByEventId[event._id.toString()];
        if (minPrice === undefined) return false; // Exclude events with no tiers
        
        if (budgetFilter === 'under_50k') return minPrice < 50000;
        if (budgetFilter === '50k_to_2L') return minPrice >= 50000 && minPrice <= 200000;
        if (budgetFilter === 'over_2L') return minPrice > 200000;
        return true;
      });
    }

    const matchedEvents = events.map(event => {
      let score = 15; // Base Alignment Score

      // 1. Budget Tier Matching
      if (sponsor.budgetTier === 'enterprise' && event.expectedCrowdSize > 500) score += 30;
      else if ((sponsor.budgetTier === 'large' || sponsor.budgetTier === 'medium') && event.expectedCrowdSize > 200) score += 20;
      else if (sponsor.budgetTier === 'small' && event.expectedCrowdSize <= 200) score += 10;

      // 2. Credibility Score influence
      score += (sponsor.credibilityScore * 3); // Max 25 points

      // 3. Social Media Reach influence
      if (event.socialMediaReach > 10000) score += 15;
      else if (event.socialMediaReach > 5000) score += 10;

      // Ensure score is capped at 100
      score = Math.min(score, 100);

      return {
        event,
        matchScore: score,
        matchReason: `Matched based on crowd size (${event.expectedCrowdSize}) and budget tier.`,
      };
    });

    // Sort by descending score
    matchedEvents.sort((a, b) => b.matchScore - a.matchScore);
    return matchedEvents;
  }
// Rafi end

// Rafi
  static async discoverSponsorsForEvent(eventId, filters = {}) {
    const { search, industryFilter, budgetFilter } = filters;
    const event = await Event.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const query = { role: 'sponsor', isActive: true };

    // 1. Search Filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Industry Filter
    if (industryFilter && industryFilter !== 'any') {
      // exact match case-insensitive
      query.industry = { $regex: new RegExp(`^${industryFilter}$`, 'i') };
    }

    // 3. Budget Filter
    if (budgetFilter && budgetFilter !== 'any') {
      query.budgetTier = budgetFilter;
    }

    // Fetch matching sponsors
    const sponsors = await User.find(query);

    const matchedSponsors = sponsors.map(sponsor => {
      let score = 40; // Base Alignment Score

      // 1. Budget Tier Matching
      if (event.expectedCrowdSize > 500 && sponsor.budgetTier === 'enterprise') score += 30;
      else if (event.expectedCrowdSize > 200 && (sponsor.budgetTier === 'large' || sponsor.budgetTier === 'medium')) score += 20;
      else if (event.expectedCrowdSize <= 200 && sponsor.budgetTier === 'small') score += 10;

      // 2. Credibility Score influence
      score += (sponsor.credibilityScore * 5); // Max 25 points

      // 3. Social Media Reach influence
      if (event.socialMediaReach > 10000) score += 15;
      else if (event.socialMediaReach > 5000) score += 10;

      // Ensure score is capped at 100
      score = Math.min(score, 100);

      return {
        sponsor: {
          _id: sponsor._id,
          name: sponsor.name,
          organizationName: sponsor.organizationName,
          industry: sponsor.industry,
          budgetTier: sponsor.budgetTier,
          credibilityScore: sponsor.credibilityScore,
        },
        matchScore: score,
        matchReason: `Matched based on ${sponsor.industry || 'general'} industry and budget tier.`,
      };
    });

    // Sort by descending score
    matchedSponsors.sort((a, b) => b.matchScore - a.matchScore);
    return matchedSponsors;
  }
// Rafi end
}

module.exports = MatchService;
