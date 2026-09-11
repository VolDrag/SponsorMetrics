const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { readAccessToken, jwtSecret } = require('../utils/session');

const authenticate = async (req, res, next) => {
  try {
    const token = readAccessToken(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. No token provided.',
      });
    }

    const decoded = jwt.verify(token, jwtSecret());
    if (decoded.typ && decoded.typ !== 'access') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Invalid token.',
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists',
      });
    }

    if (user.isActive === false) {
      return res.status(401).json({
        success: false,
        message: 'User account is deactivated',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid token.',
    });
  }
};

module.exports = authenticate;
module.exports.authenticate = authenticate;
