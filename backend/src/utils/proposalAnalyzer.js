function analyzeProposal(proposal) {
  let score = 100;
  const tips = [];
  const warnings = [];

  const safeNumber = (val, fallback = 0) => {
    const num = Number(val);
    return isNaN(num) ? fallback : num;
  };

  const budget = safeNumber(proposal.budget);
  const expectedCrowd = safeNumber(proposal.expectedCrowdSize || proposal.expectedCrowd);
  const socialMediaReach = safeNumber(proposal.socialMediaReach);
  const description = proposal.aiGeneratedText || proposal.rawBulletPoints || proposal.description || '';
  const venue = proposal.venue || '';
  const eventName = proposal.name || proposal.eventName || '';
  const tiers = proposal.tiers || proposal.sponsorshipTiers || [];
  const eventDate = proposal.date || proposal.eventDate || null;
  const contactEmail = proposal.contactEmail || '';

  // Rule 1: Budget vs Expected Crowd Size
  if (expectedCrowd > 0) {
    const budgetPerPerson = budget / expectedCrowd;
    if (budgetPerPerson > 500) {
      score -= 15;
      tips.push(`💰 Your budget (${budget.toLocaleString()} BDT) is high for a crowd of ${expectedCrowd} people. Consider adjusting or justifying the premium.`);
    } else if (budgetPerPerson < 50 && budget > 0) {
      score -= 5;
      tips.push(`💡 Your budget seems low (${Math.round(budgetPerPerson)} BDT/person) — sponsors may question if you can deliver quality.`);
    } else if (budgetPerPerson >= 100 && budgetPerPerson <= 300) {
      score += 5;
      warnings.push(`✅ Budget per person (${Math.round(budgetPerPerson)} BDT) is in a healthy range.`);
    }
  } else if (budget > 0 && expectedCrowd === 0) {
    score -= 10;
    tips.push(`📊 Add your expected crowd size so sponsors can evaluate cost-per-reach.`);
  }

  // Rule 2: Description Length
  if (description.length < 100) {
    score -= 20;
    tips.push(`📝 Description is short (${description.length} chars). Add more details to build sponsor trust.`);
  } else if (description.length < 300) {
    score -= 10;
    tips.push(`✍️ Description is ${description.length} chars. Add specific venue & audience details.`);
  } else if (description.length >= 500) {
    score += 5;
    warnings.push(`🌟 Great detail! Description is comprehensive.`);
  }

  // Rule 3: Venue Details
  if (!venue || venue.trim().length < 5) {
    score -= 15;
    tips.push(`📍 Add specific venue details (e.g., "Dhaka University Central Field").`);
  } else if (venue.toLowerCase().includes('university') || venue.toLowerCase().includes('college')) {
    score += 3;
    warnings.push(`🏫 University venues attract sponsors targeting young demographics.`);
  }

  // Rule 4: Social Media Reach
  if (!socialMediaReach || socialMediaReach < 100) {
    score -= 10;
    tips.push(`📢 Social media reach is low. Consider highlighting social media presence or past event photos.`);
  } else if (socialMediaReach >= 5000) {
    score += 5;
    warnings.push(`🌟 Strong social media reach (${socialMediaReach})!`);
  }

  // Rule 5: Sponsorship Tiers
  if (tiers.length === 0) {
    score -= 20;
    tips.push(`🏆 Add sponsorship tiers (Gold/Silver/Bronze) to help sponsors decide.`);
  } else if (tiers.length >= 3) {
    score += 5;
    warnings.push(`✅ You have ${tiers.length} sponsorship tiers — great options for sponsors.`);
  }

  // Rule 6: Event Date
  if (eventDate) {
    const daysUntilEvent = Math.ceil((new Date(eventDate) - new Date()) / (1000 * 60 * 60 * 24));
    if (daysUntilEvent < 0) {
      score -= 20;
      tips.push(`❌ Event date has passed. Please update to a future date.`);
    } else if (daysUntilEvent < 14) {
      score -= 15;
      tips.push(`⏰ Event is only ${daysUntilEvent} days away! Sponsors need 2-4 weeks lead time.`);
    } else if (daysUntilEvent > 90) {
      score += 5;
      warnings.push(`📅 Excellent planning! ${daysUntilEvent} days lead time.`);
    }
  } else {
    score -= 10;
    tips.push(`📅 Please set an event date.`);
  }

  // Rule 7: Contact Information
  if (!contactEmail) {
    score -= 10;
    tips.push(`📞 Add a contact email so sponsors can reach you easily.`);
  }

  score = Math.max(0, Math.min(100, score));

  let status = "Excellent";
  if (score < 90) status = "Very Good";
  if (score < 75) status = "Good";
  if (score < 60) status = "Needs Improvement";
  if (score < 40) status = "Weak";

  return {
    score,
    status,
    tips: [...warnings, ...tips],
    breakdown: {
      budgetScore: budget > 0 ? Math.min(100, Math.round((Math.min(budget, expectedCrowd * 300) / (expectedCrowd * 300 || 1)) * 100)) : 0,
      descriptionScore: Math.min(100, Math.round((description.length / 600) * 100)),
      venueScore: venue.trim().length > 5 ? 100 : 0,
      reachScore: Math.min(100, Math.round((socialMediaReach / 5000) * 100)),
      tiersScore: tiers.length > 0 ? Math.min(100, tiers.length * 33) : 0,
    },
    maxScore: 100,
    checkedAt: new Date().toISOString()
  };
}

module.exports = { analyzeProposal };
