const rateLimit = require('express-rate-limit');

const keyByUserOrIp = (req) => {
  if (req.user && req.user._id) return String(req.user._id);
  return req.ip;
};

const jsonHandler = (_req, res) => {
  res.status(429).json({
    success: false,
    message: 'Too many requests. Please wait and try again.',
  });
};

exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AUTH || 20),
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler,
});

exports.sendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_SEND || 20),
  keyGenerator: keyByUserOrIp,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler,
  validate: false,
});

exports.aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_AI || 15),
  keyGenerator: keyByUserOrIp,
  standardHeaders: true,
  legacyHeaders: false,
  handler: jsonHandler,
  validate: false,
});
