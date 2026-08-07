// backend/src/utils/proposalAnalyzer.js

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
      tips.push(`💰 Your budget (${budget.toLocaleString()} BDT) is a bit high for a crowd of ${expectedCrowd} people. That's ${Math.round(budgetPerPerson)} BDT per person — consider adjusting or justify the premium.`);
    } else if (budgetPerPerson < 50 && budget > 0) {
      score -= 5;
      tips.push(`💡 Your budget seems quite low (${Math.round(budgetPerPerson)} BDT per person) — sponsors might question if you can deliver quality.`);
    } else if (budgetPerPerson >= 100 && budgetPerPerson <= 300) {
      score += 5;
      warnings.push(`✅ Your budget per person (${Math.round(budgetPerPerson)} BDT) is in a healthy range.`);
    }
  } else if (budget > 0 && expectedCrowd === 0) {
    score -= 10;
    tips.push(`📊 You have a budget but no expected crowd size. Add your expected attendance so sponsors can evaluate cost-per-reach.`);
  }

  // Rule 2: Description Length
  if (description.length < 100) {
    score -= 20;
    tips.push(`📝 Your proposal description is only ${description.length} characters. Try adding more details about your event — a strong description builds trust with sponsors.`);
  } else if (description.length < 300) {
    score -= 10;
    tips.push(`✍️ Your description is ${description.length} characters. Adding more specifics about your venue, agenda, and audience demographics would help.`);
  } else if (description.length >= 500) {
    score += 5;
    warnings.push(`🌟 Great detail! Your description is comprehensive.`);
  }

  // Rule 3: Venue Details
  if (!venue || venue.trim().length < 5) {
    score -= 15;
    tips.push(`📍 Try adding more details about your venue. Sponsors want to know exactly where their brand will be seen (e.g., "Dhaka University Central Field" instead of just "Dhaka").`);
  } else if (venue.toLowerCase().includes('university') || venue.toLowerCase().includes('college')) {
    score += 3;
    warnings.push(`🏫 University venues are attractive to sponsors targeting young demographics.`);
  }

  // Rule 4: Social Media Reach
  if (!socialMediaReach || socialMediaReach < 100) {
    score -= 10;
    tips.push(`📢 Your social media reach is low (${socialMediaReach || 0}). Consider highlighting your social media presence or past event photos to show credibility.`);
  } else if (socialMediaReach < 1000) {
    score -= 5;
    tips.push(`📢 Your social media reach is ${socialMediaReach}. Growing this before sending proposals can significantly improve sponsor interest.`);
  } else if (socialMediaReach >= 5000) {
    score += 5;
    warnings.push(`🌟 Strong social media reach (${socialMediaReach})! Make sure to highlight engagement rates too.`);
  }

  // Rule 5: Sponsorship Tiers
  if (tiers.length === 0) {
    score -= 20;
    tips.push(`🏆 You haven't created any sponsorship tiers (Gold/Silver/Bronze). Clear packages make it much easier for sponsors to decide and commit.`);
  } else if (tiers.length === 1) {
    score -= 10;
    tips.push(`🎯 You only have 1 sponsorship tier. Consider offering at least 2-3 options to give sponsors flexibility at different budget levels.`);
  } else if (tiers.length >= 3) {
    score += 5;
    warnings.push(`✅ You have ${tiers.length} sponsorship tiers — great for capturing different sponsor budgets.`);
  }

  // Rule 6: Event Date (Lead Time)
  if (eventDate) {
    const eventDateObj = new Date(eventDate);
    const today = new Date();
    const daysUntilEvent = Math.ceil((eventDateObj - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEvent < 0) {
      score -= 20;
      tips.push(`❌ Your event date has already passed! Please update to a future date.`);
    } else if (daysUntilEvent < 14 && daysUntilEvent >= 0) {
      score -= 15;
      tips.push(`⏰ Your event is only ${daysUntilEvent} days away! Sponsors need at least 2-4 weeks to plan — consider pushing the date or expediting outreach.`);
    } else if (daysUntilEvent < 30) {
      score -= 5;
      tips.push(`⏰ Your event is ${daysUntilEvent} days away. Some sponsors may need more lead time — highlight urgency as an opportunity for quick brand activation.`);
    } else if (daysUntilEvent > 90) {
      score += 5;
      warnings.push(`📅 Excellent planning! You have ${daysUntilEvent} days of lead time — plenty for sponsors to plan campaigns around your event.`);
    }
  } else {
    score -= 10;
    tips.push(`📅 Please set an event date. Sponsors need to know when the activation will happen.`);
  }

  // Rule 7: Contact Information
  if (!contactEmail) {
    score -= 10;
    tips.push(`📞 Add a contact email so sponsors can reach you easily. Missing contact info is a major red flag for sponsors.`);
  }

  // Rule 8: Event Name
  if (!eventName || eventName.trim().length < 3) {
    score -= 10;
    tips.push(`🏷️ Give your event a clear, descriptive name (e.g., "Dhaka Tech Fest 2026" instead of "Event").`);
  } else if (eventName.length > 10) {
    score += 2;
    warnings.push(`✅ Your event name "${eventName}" is descriptive and clear.`);
  }

  // Rule 9: Budget Reasonableness
  if (budget > 0) {
    if (budget > 1000000) {
      score -= 10;
      tips.push(`💰 Your budget (${budget.toLocaleString()} BDT) is very high. Make sure your proposal justifies this with detailed deliverables and reach metrics.`);
    } else if (budget < 5000 && expectedCrowd > 100) {
      score -= 5;
      tips.push(`💡 Your budget seems low for the expected crowd. Sponsors may question if you can deliver professional quality.`);
    }
  } else {
    score -= 15;
    tips.push(`💰 Please set a budget. Sponsors need to know the investment required upfront.`);
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
      timingScore: eventDate ? (() => {
        const days = Math.ceil((new Date(eventDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (days < 0) return 0;
        if (days < 14) return 30;
        if (days < 30) return 60;
        if (days > 90) return 100;
        return 80;
      })() : 0
    },
    maxScore: 100,
    checkedAt: new Date().toISOString()
  };
}

module.exports = { analyzeProposal };