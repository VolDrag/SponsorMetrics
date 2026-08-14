const axios = require('axios');

// MODULE 2 | Feature 1: Proposal Creator — AI Proposal Assistant (Gemini rewrite)
const GEMINI_MODELS = ['gemini-flash-latest', 'gemini-pro-latest', 'gemini-flash-lite-latest'];

const buildPrompt = (bulletPoints, context = {}) => {
  const eventLine = context.eventName
    ? `Event: ${context.eventName}`
    : 'Event: (not specified)';
  const venueLine = context.venue ? `Venue: ${context.venue}` : '';
  const crowdLine = context.expectedCrowdSize
    ? `Expected crowd: ${context.expectedCrowdSize}`
    : '';
  const tierLine = context.tierName
    ? `Requested package: ${context.tierName}${context.proposedBudget ? ` (${context.proposedBudget} BDT)` : ''}`
    : '';
  const goalsLine = context.goals ? `Organizer goals: ${context.goals}` : '';
  const notesLine = context.notes ? `Additional notes: ${context.notes}` : '';

  return [
    'You are a professional sponsorship proposal writer for Bangladeshi events (university clubs, NGOs, and startups pitching to corporate marketing managers).',
    'Rewrite the organizer\'s rough bullet points into persuasive, polished business English.',
    'Keep facts accurate. Do not invent numbers, brands, or dates that are not in the input.',
    'Write 3 to 5 short paragraphs. No markdown headings. No bullet lists in the output. Return only the proposal text.',
    '',
    eventLine,
    venueLine,
    crowdLine,
    tierLine,
    goalsLine,
    notesLine,
    '',
    'Rough notes from the organizer:',
    bulletPoints,
  ]
    .filter(Boolean)
    .join('\n');
};

const localRewrite = (bulletPoints, context = {}) => {
  const eventName = context.eventName || 'our upcoming event';
  const venue = context.venue ? ` at ${context.venue}` : '';
  const crowd = context.expectedCrowdSize
    ? ` We anticipate approximately ${Number(context.expectedCrowdSize).toLocaleString()} attendees`
    : '';
  const tier = context.tierName
    ? ` We are inviting you to partner with us through the ${context.tierName} package`
    : ' We would welcome the opportunity to structure a package around your brand objectives';
  const budget = context.proposedBudget
    ? ` at a proposed investment of BDT ${Number(context.proposedBudget).toLocaleString()}`
    : '';
  const goals = context.goals
    ? ` Our partnership goals include: ${context.goals}.`
    : '';
  const notes = context.notes ? ` ${context.notes}` : '';
  const cleaned = String(bulletPoints || '')
    .split('\n')
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
    .join(' ');

  return (
    `On behalf of the organizing team, we are pleased to present a sponsorship opportunity for ${eventName}${venue}.` +
    `${crowd}${crowd ? ', offering a focused audience for brand visibility and meaningful engagement in Bangladesh.' : '.'}` +
    `\n\n${tier}${budget}. ${cleaned}` +
    `${goals}${notes}` +
    `\n\nWe would be glad to walk through deliverables, timelines, and reporting so your marketing team can evaluate fit with confidence. Thank you for considering this partnership.`
  );
};

const extractText = (data) => {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  return parts
    .map((part) => part.text)
    .filter(Boolean)
    .join('\n')
    .trim();
};

exports.rewriteProposal = async (bulletPoints, context = {}) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const prompt = buildPrompt(bulletPoints, context);

  if (!apiKey) {
    return {
      text: localRewrite(bulletPoints, context),
      source: 'fallback',
    };
  }

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const { data } = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        },
        {
          params: { key: apiKey },
          timeout: 20000,
        }
      );

      const text = extractText(data);
      if (text) {
        return { text, source: 'gemini' };
      }
    } catch (error) {
      continue;
    }
  }

  return {
    text: localRewrite(bulletPoints, context),
    source: 'fallback',
  };
};

