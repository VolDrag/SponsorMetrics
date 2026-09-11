const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const ACCESS_COOKIE = 'access_token';
const REFRESH_COOKIE = 'refresh_token';
const ACCESS_TTL = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const REFRESH_DAYS = Number(process.env.JWT_REFRESH_DAYS || 7);
const MAX_REFRESH_SESSIONS = 5;

const isProd = process.env.NODE_ENV === 'production';

const cookieBase = () => ({
  httpOnly: true,
  secure: process.env.COOKIE_SECURE === 'true' || isProd,
  sameSite: process.env.COOKIE_SAMESITE || (isProd ? 'none' : 'lax'),
  path: '/',
});

const jwtSecret = () => process.env.JWT_SECRET || 'secret';

const hashToken = (raw) => crypto.createHash('sha256').update(String(raw)).digest('hex');

const signAccessToken = (userId) =>
  jwt.sign({ id: userId, typ: 'access' }, jwtSecret(), { expiresIn: ACCESS_TTL });

const accessMaxAgeMs = () => 15 * 60 * 1000;
const refreshMaxAgeMs = () => REFRESH_DAYS * 24 * 60 * 60 * 1000;

const setAuthCookies = (res, { accessToken, refreshToken }) => {
  const base = cookieBase();
  res.cookie(ACCESS_COOKIE, accessToken, { ...base, maxAge: accessMaxAgeMs() });
  res.cookie(REFRESH_COOKIE, refreshToken, { ...base, maxAge: refreshMaxAgeMs() });
};

const clearAuthCookies = (res) => {
  const base = cookieBase();
  res.clearCookie(ACCESS_COOKIE, base);
  res.clearCookie(REFRESH_COOKIE, base);
};

const createRefreshRaw = () => crypto.randomBytes(48).toString('hex');

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  isVerified: user.isVerified,
  organizationName: user.organizationName,
  organizationType: user.organizationType,
  industry: user.industry,
  budgetTier: user.budgetTier,
  orgVerified: Boolean(user.orgVerified),
  kycStatus: user.kycStatus || 'none',
  phone: user.phone || '',
});

const issueSession = async (user, res) => {
  const accessToken = signAccessToken(user._id);
  const refreshRaw = createRefreshRaw();
  const tokenHash = hashToken(refreshRaw);
  const expiresAt = new Date(Date.now() + refreshMaxAgeMs());

  const sessions = Array.isArray(user.refreshTokens) ? user.refreshTokens : [];
  sessions.push({ tokenHash, expiresAt, createdAt: new Date() });
  user.refreshTokens = sessions
    .filter((row) => row.expiresAt && row.expiresAt > new Date())
    .slice(-MAX_REFRESH_SESSIONS);
  await user.save({ validateBeforeSave: false });

  setAuthCookies(res, { accessToken, refreshToken: refreshRaw });
  return { user: publicUser(user), accessToken };
};

const rotateRefresh = async (req, res) => {
  const raw = req.cookies && req.cookies[REFRESH_COOKIE];
  if (!raw) return null;

  const tokenHash = hashToken(raw);
  const User = require('../models/User');
  const user = await User.findOne({ 'refreshTokens.tokenHash': tokenHash }).select('+refreshTokens');
  if (!user) return null;

  const session = (user.refreshTokens || []).find((row) => row.tokenHash === tokenHash);
  if (!session || session.expiresAt < new Date()) {
    user.refreshTokens = (user.refreshTokens || []).filter((row) => row.tokenHash !== tokenHash);
    await user.save({ validateBeforeSave: false });
    return null;
  }

  user.refreshTokens = (user.refreshTokens || []).filter((row) => row.tokenHash !== tokenHash);
  return issueSession(user, res);
};

const revokeRefresh = async (req) => {
  const raw = req.cookies && req.cookies[REFRESH_COOKIE];
  if (!raw) return;
  const tokenHash = hashToken(raw);
  const User = require('../models/User');
  await User.updateOne(
    { 'refreshTokens.tokenHash': tokenHash },
    { $pull: { refreshTokens: { tokenHash } } }
  );
};

const readAccessToken = (req) => {
  if (req.cookies && req.cookies[ACCESS_COOKIE]) return req.cookies[ACCESS_COOKIE];
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

module.exports = {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  signAccessToken,
  jwtSecret,
  issueSession,
  rotateRefresh,
  revokeRefresh,
  clearAuthCookies,
  readAccessToken,
  publicUser,
};
