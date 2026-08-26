const axios = require('axios');

const GEMINI_MODELS = [...new Set([
  process.env.GEMINI_MODEL,
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-flash-latest',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-1.5-flash',
].filter(Boolean))];

const readKey = () => String(process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');

const apiErrorText = (error) => {
  const payload = error.response?.data;
  const message =
    payload?.error?.message ||
    payload?.error ||
    payload?.message ||
    (typeof payload === 'string' ? payload : null) ||
    error.message;
  const status = error.response?.status;
  const text = typeof message === 'string' ? message : JSON.stringify(message);
  return [status, text].filter(Boolean).join(' ').slice(0, 400);
};

const extractText = (data) => {
  const parts = data?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  const visible = parts.filter((part) => !part.thought).map((part) => part.text).filter(Boolean);
  if (visible.length) return visible.join('\n').trim();
  return parts.map((part) => part.text).filter(Boolean).join('\n').trim();
};

const postGemini = async (url, apiKey, body) => {
  try {
    return await axios.post(url, body, {
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      timeout: 35000,
    });
  } catch (headerError) {
    const status = headerError.response?.status;
    if (status === 404 || status === 429) throw headerError;
    return axios.post(url, body, {
      params: { key: apiKey },
      timeout: 35000,
    });
  }
};

const callGeminiText = async (prompt, {
  temperature = 0.6,
  maxOutputTokens = 1024,
  systemInstruction,
  jsonMode = false,
} = {}) => {
  const apiKey = readKey();
  if (!apiKey) return { text: null, error: 'GEMINI_API_KEY is missing' };

  let lastError = 'Gemini request failed';
  for (const version of ['v1beta', 'v1']) {
    for (const model of GEMINI_MODELS) {
      const generationConfig = { temperature, maxOutputTokens };
      if (jsonMode) {
        generationConfig.responseMimeType = 'application/json';
      }
      if (/gemini-(2\.5|3)/.test(model)) {
        generationConfig.thinkingConfig = { thinkingBudget: 0 };
      }

      const body = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      };
      if (systemInstruction) {
        body.systemInstruction = { parts: [{ text: systemInstruction }] };
      }

      const url = `https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent`;
      try {
        const { data } = await postGemini(url, apiKey, body);
        const text = extractText(data);
        if (text) return { text, error: null };
        const block = data?.promptFeedback?.blockReason || data?.candidates?.[0]?.finishReason;
        lastError = block ? `Gemini returned no text (${block})` : 'Gemini returned an empty response';
      } catch (error) {
        lastError = apiErrorText(error);
        continue;
      }
    }
  }

  console.error('[gemini]', lastError);
  return { text: null, error: lastError };
};

// MODULE 2 | Feature 1: Proposal Creator — AI Proposal Assistant
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

exports.rewriteProposal = async (bulletPoints, context = {}) => {
  const systemInstruction = [
    'You write formal sponsorship proposals for Bangladeshi university, NGO, and startup events.',
    'Rewrite the organizer notes into 3 to 5 short paragraphs of professional business English.',
    'Keep facts accurate. Do not invent numbers, brands, or dates that are not in the notes.',
    'Return only the proposal body. Never repeat these instructions. Never write “Let’s write the draft”.',
  ].join(' ');

  const prompt = [
    context.eventName ? `Event: ${context.eventName}` : '',
    context.venue ? `Venue: ${context.venue}` : '',
    context.expectedCrowdSize ? `Expected crowd: ${context.expectedCrowdSize}` : '',
    context.tierName
      ? `Requested package: ${context.tierName}${context.proposedBudget ? ` (${context.proposedBudget} BDT)` : ''}`
      : '',
    context.goals ? `Organizer goals: ${context.goals}` : '',
    context.notes ? `Additional notes: ${context.notes}` : '',
    '',
    'Rough notes from the organizer:',
    bulletPoints,
  ]
    .filter((line) => line !== '')
    .join('\n');

  const result = await callGeminiText(prompt, {
    temperature: 0.7,
    maxOutputTokens: 1024,
    systemInstruction,
  });

  if (result.text) {
    const text = cleanAnalystText(result.text);
    if (text) return { text, source: 'gemini' };
  }

  return {
    text: localRewrite(bulletPoints, context),
    source: 'fallback',
    error: result.error,
  };
};

// ===== MODULE 3 FEATURE 2: Sponsorship Performance & ROI Analytics — AI insights — START =====
const formatKpi = (value, suffix = '') =>
  value === null || value === undefined || !Number.isFinite(Number(value))
    ? 'n/a'
    : `${Number(value).toLocaleString()}${suffix}`;

const localRoiInsight = (question, roiPayload = {}) => {
  const events = Array.isArray(roiPayload.events) ? roiPayload.events : [];
  const averages = roiPayload.averages || {};

  if (!events.length) {
    return 'No post-event numbers are on file yet. Once organizers submit reach, engagement, and attendance, this assistant can explain cost-per-reach, setbacks, and where to improve.';
  }

  const worseReach = events.filter(
    (row) =>
      row.costPerReach != null &&
      averages.costPerReach != null &&
      Number(row.costPerReach) > Number(averages.costPerReach)
  );
  const worseEngagement = events.filter(
    (row) =>
      row.costPerEngagement != null &&
      averages.costPerEngagement != null &&
      Number(row.costPerEngagement) > Number(averages.costPerEngagement)
  );
  const weakGrowth = events.filter((row) => Number(row.audienceGrowth) < 0);

  const setbackNames = [...new Set([...worseReach, ...worseEngagement, ...weakGrowth].map((row) => row.eventName))];

  return [
    `Across ${events.length} sponsored event(s), average cost-per-reach is ${formatKpi(averages.costPerReach)} and average cost-per-engagement is ${formatKpi(averages.costPerEngagement)}. Audience growth averages ${formatKpi(averages.audienceGrowth, '%')}.`,
    setbackNames.length
      ? `Setbacks: ${setbackNames.join(', ')} sit above your historical cost averages and/or show shrinking attendance. Higher cost-per-reach or cost-per-engagement means you paid more for each impression or interaction than your other activations.`
      : 'No clear setbacks versus your own averages — costs and growth are in line with your history.',
    'To improve: prioritize formats that already beat your averages, ask organizers for proof (crowd photos, post analytics) before renewing expensive packages, and shift budget toward events with stronger engagement per taka.',
    `Your question: "${String(question || '').trim() || 'Summarize my stats'}". Use the charts above to compare each event against the average reference lines.`,
  ].join('\n\n');
};

const compactRoiForPrompt = (roiPayload = {}) => {
  const events = Array.isArray(roiPayload.events) ? roiPayload.events : [];
  return {
    averages: roiPayload.averages || {},
    events: events.map((row) => ({
      eventName: row.eventName,
      eventDate: row.eventDate,
      venue: row.venue,
      organizerName: row.organizerName,
      sponsorshipCost: row.sponsorshipCost,
      totalReach: row.totalReach,
      totalEngagement: row.totalEngagement,
      attendeeCount: row.attendeeCount,
      costPerReach: row.costPerReach,
      costPerEngagement: row.costPerEngagement,
      audienceGrowth: row.audienceGrowth,
      benchmarks: row.benchmarks,
    })),
  };
};

const cleanAnalystText = (text) => {
  let out = String(text || '').trim();
  out = out.replace(/^\(?\s*No markdown headings[^)\n]*\)?:?\*+\s*/i, '');
  out = out.replace(/^Let's write the draft:\s*/i, '');
  out = out.replace(/^Welcome to (your )?SponsorMetrics BD dashboard\.?\s*/i, '');
  out = out.replace(/Keep the answer under 250 words[^\n]*/gi, '');
  out = out.replace(/No markdown headings[^\n]*/gi, '');
  out = out.replace(/^\*\*+\s*/gm, '');
  out = out.replace(/^#+\s+/gm, '');
  return out.replace(/\n{3,}/g, '\n\n').trim();
};

exports.explainRoiStats = async (question, roiPayload = {}, history = []) => {
  const compact = compactRoiForPrompt(roiPayload);
  const historyBlock = Array.isArray(history) && history.length
    ? history
        .slice(-6)
        .map((turn) => `${turn.role === 'assistant' ? 'Analyst' : 'Sponsor'}: ${turn.content}`)
        .join('\n')
    : '';

  const systemInstruction = [
    'You are a sponsorship ROI analyst for SponsorMetrics BD.',
    'Answer only the sponsor’s question using the KPI JSON in the user message.',
    'Do not invent events, spend, or metrics. If events is empty, say no post-event metrics exist yet.',
    'Never repeat these instructions. Never write a welcome message, proposal draft, or marketing copy.',
    'Do not mention word limits, markdown rules, or that you are following a prompt.',
    'Write 2–5 short paragraphs or a few bullets. Cite event names and the actual numbers.',
  ].join(' ');

  const prompt = [
    'KPI JSON:',
    JSON.stringify(compact),
    historyBlock ? `Conversation so far:\n${historyBlock}` : '',
    `Question: ${question}`,
  ]
    .filter(Boolean)
    .join('\n\n');

  const result = await callGeminiText(prompt, {
    temperature: 0.2,
    maxOutputTokens: 900,
    systemInstruction,
  });
  if (result.text) {
    const text = cleanAnalystText(result.text);
    if (text) {
      return { text, source: 'gemini' };
    }
  }

  return { text: localRoiInsight(question, roiPayload), source: 'fallback', error: result.error };
};
// ===== MODULE 3 FEATURE 2: Sponsorship Performance & ROI Analytics — AI insights — END =====

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

const sanitizeJsonCandidate = (raw) =>
  String(raw || '')
    .replace(/^\uFEFF/, '')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/,\s*([}\]])/g, '$1')
    .trim();

const tryParseJson = (raw) => {
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return null;
  }
};

const sliceBalanced = (raw, openChar, closeChar, startAt = 0) => {
  const start = raw.indexOf(openChar, startAt);
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < raw.length; i += 1) {
    const ch = raw[i];
    if (inString) {
      if (escape) escape = false;
      else if (ch === '\\') escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === openChar) depth += 1;
    else if (ch === closeChar) {
      depth -= 1;
      if (depth === 0) return raw.slice(start, i + 1);
    }
  }
  return null;
};

const extractJsonArray = (text) => {
  if (!text) return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const raw = sanitizeJsonCandidate(fenced ? fenced[1] : text);

  const arrayStart = raw.search(/\[\s*\{/);
  const objectStart = raw.search(/\{\s*"/);
  const candidates = [
    raw,
    arrayStart === -1 ? null : sliceBalanced(raw, '[', ']', arrayStart),
    objectStart === -1 ? null : sliceBalanced(raw, '{', '}', objectStart),
  ].filter(Boolean);

  let parsed = null;
  for (const candidate of candidates) {
    parsed = tryParseJson(candidate);
    if (parsed) break;
  }
  if (!parsed) return null;

  const list = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed.recommendations)
      ? parsed.recommendations
      : Array.isArray(parsed.advice)
        ? parsed.advice
        : null;
  if (!list) return null;

  return list
    .map((item) => ({
      title: String(item.title || item.heading || '').trim(),
      description: String(item.description || item.body || item.details || '').trim(),
      category: MARKETING_CATEGORIES.includes(item.category) ? item.category : 'content',
    }))
    .filter((item) => item.title && item.description);
};

exports.generateMarketingAdvice = async (context = {}) => {
  const systemInstruction = [
    'You are a sponsorship marketing consultant for Bangladeshi university, NGO, and startup events.',
    'Return only a JSON array of 3 to 5 objects.',
    'Each object must have keys title, description, and category.',
    'category must be exactly one of: channel, content, pricing.',
    'Ground every suggestion in the event data. Do not invent metrics that are not provided.',
    'No markdown, no commentary, no code fences.',
  ].join(' ');

  const prompt = [
    `Event: ${context.eventName || 'n/a'}`,
    `Venue: ${context.venue || 'n/a'}`,
    `Date: ${context.date || 'n/a'}`,
    `Category / organizer type: ${context.organizerType || 'n/a'}`,
    `Expected crowd: ${context.expectedCrowdSize || 'n/a'}`,
    `Social reach: ${context.socialMediaReach || 'n/a'}`,
    `Package budget range: ${context.budgetRange || 'n/a'}`,
    `Past performance: ${context.pastPerformance || 'none on file'}`,
  ].join('\n');

  const result = await callGeminiText(prompt, {
    temperature: 0.3,
    maxOutputTokens: 2048,
    systemInstruction,
    jsonMode: true,
  });
  const parsed = extractJsonArray(result.text);
  if (parsed && parsed.length) {
    return { recommendations: parsed, source: 'gemini' };
  }

  if (result.text) {
    console.error('[gemini] marketing JSON parse failed:', String(result.text).slice(0, 400));
  }

  return {
    recommendations: localMarketingAdvice(context),
    source: 'fallback',
    error: result.error || (result.text ? 'Gemini returned text that was not valid JSON advice' : undefined),
  };
};
// ===== MODULE 4 FEATURE 4: AI-Powered Marketing Consultation — END =====
