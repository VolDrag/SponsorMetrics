const fs = require('fs');
const path = require('path');
const axios = require('axios');
const PhotoHash = require('../models/PhotoHash');

// ===== MODULE 4 FEATURE 3: Media Forensics for Event Proofs — START =====
const HF_MODEL = process.env.HF_AI_DETECTOR_MODEL || 'umm-maybe/AI-image-detector';
const AI_FLAG_THRESHOLD = 0.7;
const HASH_DISTANCE_THRESHOLD = 10;

const hamming = (a, b) => {
  if (!a || !b || a.length !== b.length) return 64;
  let dist = 0;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) dist += 1;
  }
  return dist;
};

const computeAverageHash = async (filePath) => {
  const sharp = require('sharp');
  const { data, info } = await sharp(filePath)
    .grayscale()
    .resize(8, 8, { fit: 'fill' })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = Array.from(data.slice(0, info.width * info.height));
  const mean = pixels.reduce((sum, value) => sum + value, 0) / pixels.length;
  return pixels.map((value) => (value >= mean ? '1' : '0')).join('');
};

const detectAiScore = async (filePath) => {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) return null;

  const image = fs.readFileSync(filePath);
  const urls = [
    `https://api-inference.huggingface.co/models/${HF_MODEL}`,
    `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`,
  ];

  for (const url of urls) {
    try {
      const { data } = await axios.post(url, image, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/octet-stream',
        },
        timeout: 15000,
        validateStatus: (status) => status < 500,
      });
      if (!Array.isArray(data)) continue;
      const aiLabel = data.find((row) =>
        /ai|fake|generated|artificial|synthetic/i.test(row.label || '')
      );
      const top = aiLabel || data[0];
      if (top && typeof top.score === 'number') return top.score;
    } catch (_error) {
      continue;
    }
  }
  return null;
};

exports.inspectImage = async (filePath, eventId) => {
  const result = {
    aiGeneratedScore: null,
    isDuplicate: false,
    duplicateOfEventId: null,
    flagged: false,
    verificationStatus: 'Unverified',
  };

  try {
    result.aiGeneratedScore = await detectAiScore(filePath);
  } catch (_error) {
    result.aiGeneratedScore = null;
  }

  try {
    const hash = await computeAverageHash(filePath);
    const previous = await PhotoHash.find({}).select('hash eventId').limit(500);
    const match = previous.find(
      (row) =>
        String(row.eventId) !== String(eventId) &&
        hamming(hash, row.hash) <= HASH_DISTANCE_THRESHOLD
    );
    if (match) {
      result.isDuplicate = true;
      result.duplicateOfEventId = match.eventId;
    }
    const url = `/uploads/reports/${path.basename(filePath)}`;
    await PhotoHash.create({ eventId, url, hash });
  } catch (_error) {
    // Fail open on hash errors — never mark fraudulent because hashing failed.
  }

  if (result.aiGeneratedScore != null && result.aiGeneratedScore >= AI_FLAG_THRESHOLD) {
    result.flagged = true;
  }
  if (result.isDuplicate) result.flagged = true;

  if (result.flagged) result.verificationStatus = 'Needs Review';
  else if (result.aiGeneratedScore != null) result.verificationStatus = 'Verified';
  else result.verificationStatus = 'Unverified';

  return result;
};
// ===== MODULE 4 FEATURE 3: Media Forensics for Event Proofs — END =====
