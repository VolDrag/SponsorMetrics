const axios = require('axios');

// MODULE 2 | Feature 1: Proposal Creator — AI Proposal Assistant (Gemini rewrite)
const GEMINI_MODELS = ['gemini-2.0-flash', 'gemini-1.5-flash'];

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

// ===== MODULE 4 FEATURE 4: AI-Powered Marketing Consultation — START =====
const MARKETING_CATEGORIES = ['channel', 'content', 'pricing'];

const localMarketingAdvice = (context = {}) => [
  {
    title: 'Lead with a campus-local channel mix',
    description: `For ${context.eventName || 'this event'} at ${context.venue || 'your venue'}, pair Facebook event ads with club WhatsApp blasts. A crowd of ${context.expectedCrowdSize || 'your expected'} attendees responds better to peer shares than cold LinkedIn outreach.`,
    category: 'channel',
  },
  {
    title: 'Package proof, not just logo placement',
    description: context.pastReach
      ? `Your last reported reach was ${context.pastReach}. Show that number and 2–3 crowd photos in the pitch so sponsors can compare cost-per-reach against their other activations.`
      : 'Ask the sponsor what proof they need (reach, booth scans, speaking clip) and write those deliverables into the tier before you send.',
    category: 'content',
  },
  {
    title: 'Anchor price to crowd, then offer a test tier',
    description: context.budgetRange
      ? `Your packages currently span ${context.budgetRange}. If that is high for ${context.expectedCrowdSize || 'this'} attendees, add a smaller social-only option so a first-time sponsor can test without overcommitting.`
      : 'Publish a low-commitment social post tier beside Gold/Silver so new brands can enter without matching the headline package.',
    category: 'pricing',
  },
];

const extractJsonArray = (text) => {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = fenced ? fenced[1] : text;
  const start = raw.indexOf('[');
  const end = raw.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(raw.slice(start, end + 1));
    if (!Array.isArray(parsed)) return null;
    return parsed
      .map((item) => ({
        title: String(item.title || '').trim(),
        description: String(item.description || '').trim(),
        category: MARKETING_CATEGORIES.includes(item.category) ? item.category : 'content',
      }))
      .filter((item) => item.title && item.description);
  } catch (_error) {
    return null;
  }
};

const callGeminiText = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  for (const model of GEMINI_MODELS) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      const { data } = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.6, maxOutputTokens: 1024 },
        },
        { params: { key: apiKey }, timeout: 20000 }
      );
      const text = extractText(data);
      if (text) return text;
    } catch (_error) {
      continue;
    }
  }
  return null;
};

exports.generateMarketingAdvice = async (context = {}) => {
  const prompt = [
    'You are a sponsorship marketing consultant for Bangladeshi university, NGO, and startup events.',
    'Return ONLY a JSON array of 3 to 5 objects with keys title, description, category.',
    'category must be one of: channel, content, pricing.',
    'Ground every suggestion in the event data below. Do not invent metrics that are not provided.',
    '',
    `Event: ${context.eventName || 'n/a'}`,
    `Venue: ${context.venue || 'n/a'}`,
    `Date: ${context.date || 'n/a'}`,
    `Category / organizer type: ${context.organizerType || 'n/a'}`,
    `Expected crowd: ${context.expectedCrowdSize || 'n/a'}`,
    `Social reach: ${context.socialMediaReach || 'n/a'}`,
    `Package budget range: ${context.budgetRange || 'n/a'}`,
    `Past performance: ${context.pastPerformance || 'none on file'}`,
  ].join('\n');

  const text = await callGeminiText(prompt);
  const parsed = extractJsonArray(text);
  if (parsed && parsed.length) {
    return { recommendations: parsed, source: 'gemini' };
  }

  return { recommendations: localMarketingAdvice(context), source: 'fallback' };
};
// ===== MODULE 4 FEATURE 4: AI-Powered Marketing Consultation — END =====
