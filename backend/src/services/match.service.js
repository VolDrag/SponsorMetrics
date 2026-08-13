const Event = require('../models/Event');
const User = require('../models/User');
const SponsorshipTier = require('../models/SponsorshipTier');


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
      const reasons = [];

      // 1. Budget Tier Matching — gradient scoring (no binary hit/miss)
      const enterpriseTiers = ['enterprise', 'pro'];
      const largeTiers     = ['large', 'growth'];
      const mediumTiers    = ['medium'];
      const smallTiers     = ['small', 'starter']; // 'starter' = smallest budget, not mid-range

      if (enterpriseTiers.includes(sponsor.budgetTier)) {
        if (event.expectedCrowdSize > 500) {
          score += 30;
          reasons.push(`perfect fit: large-scale event (${event.expectedCrowdSize} attendees)`);
        } else if (event.expectedCrowdSize > 200) {
          score += 20;
          reasons.push(`good fit: mid-to-large event (${event.expectedCrowdSize} attendees)`);
        } else {
          score += 10;
          reasons.push(`partial fit: event scale (${event.expectedCrowdSize} attendees)`);
        }
      } else if (largeTiers.includes(sponsor.budgetTier)) {
        if (event.expectedCrowdSize > 200) {
          score += 20;
          reasons.push(`strong fit: mid-to-large event (${event.expectedCrowdSize} attendees)`);
        } else if (event.expectedCrowdSize > 100) {
          score += 15;
          reasons.push(`good fit: growing event (${event.expectedCrowdSize} attendees)`);
        } else {
          score += 5;
          reasons.push(`partial fit: event scale (${event.expectedCrowdSize} attendees)`);
        }
      } else if (mediumTiers.includes(sponsor.budgetTier)) {
        if (event.expectedCrowdSize > 100) {
          score += 15;
          reasons.push(`good fit: growing event (${event.expectedCrowdSize} attendees)`);
        } else if (event.expectedCrowdSize > 50) {
          score += 10;
          reasons.push(`solid fit: community-scale event (${event.expectedCrowdSize} attendees)`);
        } else {
          score += 5;
        }
      } else if (smallTiers.includes(sponsor.budgetTier)) {
        if (event.expectedCrowdSize <= 100) {
          score += 10;
          reasons.push(`niche event suits budget tier (${event.expectedCrowdSize} attendees)`);
        } else {
          score += 3;
        }
      }

      // 2. Credibility Score influence
      const credPoints = Math.round(sponsor.credibilityScore * 3);
      score += credPoints;
      if (credPoints > 0) reasons.push(`sponsor credibility score (${sponsor.credibilityScore}/5)`);

      // 3. Social Media Reach influence
      if (event.socialMediaReach > 10000) {
        score += 15;
        reasons.push(`high social reach (${event.socialMediaReach.toLocaleString()})`);
      } else if (event.socialMediaReach > 5000) {
        score += 10;
        reasons.push(`solid social reach (${event.socialMediaReach.toLocaleString()})`);
      }

      // 4. Date urgency bonus — events happening soon score higher
      const daysUntilEvent = Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24));
      if (daysUntilEvent > 0 && daysUntilEvent <= 30) {
        score += 10;
        reasons.push(`upcoming soon (${daysUntilEvent} days away)`);
      }

      score = Math.min(score, 100);

      return {
        event,
        matchScore: score,
        matchReason: reasons.length > 0
          ? `Strong fit based on: ${reasons.join(', ')}.`
          : `General alignment with your budget tier and profile.`,
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
      let score = 15; // Base Alignment Score
      const reasons = [];

      // 1. Budget Tier Matching — gradient scoring (no binary hit/miss)
      const enterpriseTiers = ['enterprise', 'pro'];
      const largeTiers     = ['large', 'growth'];
      const mediumTiers    = ['medium'];
      const smallTiers     = ['small', 'starter']; // 'starter' = smallest budget, not mid-range

      if (enterpriseTiers.includes(sponsor.budgetTier)) {
        if (event.expectedCrowdSize > 500) {
          score += 30;
          reasons.push(`enterprise-level budget perfectly matches large event scale`);
        } else if (event.expectedCrowdSize > 200) {
          score += 20;
          reasons.push(`enterprise budget aligns well with event size (${event.expectedCrowdSize} attendees)`);
        } else {
          score += 10;
          reasons.push(`enterprise sponsor — partial scale fit (${event.expectedCrowdSize} attendees)`);
        }
      } else if (largeTiers.includes(sponsor.budgetTier)) {
        if (event.expectedCrowdSize > 200) {
          score += 20;
          reasons.push(`large budget tier matches event scale (${event.expectedCrowdSize} attendees)`);
        } else if (event.expectedCrowdSize > 100) {
          score += 15;
          reasons.push(`budget tier aligns with growing event (${event.expectedCrowdSize} attendees)`);
        } else {
          score += 5;
          reasons.push(`partial fit: event scale (${event.expectedCrowdSize} attendees)`);
        }
      } else if (mediumTiers.includes(sponsor.budgetTier)) {
        if (event.expectedCrowdSize > 100) {
          score += 15;
          reasons.push(`mid-range budget fits growing event (${event.expectedCrowdSize} attendees)`);
        } else if (event.expectedCrowdSize > 50) {
          score += 10;
          reasons.push(`mid-range budget fits community event (${event.expectedCrowdSize} attendees)`);
        } else {
          score += 5;
        }
      } else if (smallTiers.includes(sponsor.budgetTier)) {
        if (event.expectedCrowdSize <= 100) {
          score += 10;
          reasons.push(`small budget suits niche event scale (${event.expectedCrowdSize} attendees)`);
        } else {
          score += 3;
        }
      }

      // 2. Credibility Score influence
      const credPoints = Math.round(sponsor.credibilityScore * 3);
      score += credPoints;
      if (credPoints > 0) reasons.push(`credibility score ${sponsor.credibilityScore}/5`);

      // 3. Social Media Reach influence
      if (event.socialMediaReach > 10000) {
        score += 15;
        reasons.push(`event has high social media reach (${event.socialMediaReach.toLocaleString()})`);
      } else if (event.socialMediaReach > 5000) {
        score += 10;
        reasons.push(`solid event social reach`);
      }

      score = Math.min(score, 100);

      return {
        sponsor: {
          _id: sponsor._id,
          name: sponsor.name,
          organizationName: sponsor.organizationName,
          industry: sponsor.industry,
          budgetTier: sponsor.budgetTier,
          credibilityScore: sponsor.credibilityScore,
          isVerified: sponsor.isVerified,
        },
        matchScore: score,
        matchReason: reasons.length > 0
          ? `${sponsor.industry || 'General'} brand — ${reasons.join(', ')}.`
          : `General alignment with event profile.`,
      };
    });

    // Sort by descending score
    matchedSponsors.sort((a, b) => b.matchScore - a.matchScore);
    return matchedSponsors;
  }
// Rafi end
}

module.exports = MatchService;
