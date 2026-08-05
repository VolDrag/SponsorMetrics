const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ message: 'Name is required.' });
  }

  if (!email || !validateEmail(String(email).toLowerCase())) {
    return res.status(400).json({ message: 'A valid email is required.' });
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
  }

  if (!role || !['organizer', 'sponsor'].includes(role)) {
    return res.status(400).json({ message: 'Role must be organizer or sponsor.' });
  }

  return next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !validateEmail(String(email).toLowerCase())) {
    return res.status(400).json({ message: 'A valid email is required.' });
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
  }

  return next();
};

const validateVerifyOTP = (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !validateEmail(String(email).toLowerCase())) {
    return res.status(400).json({ message: 'A valid email is required.' });
  }

  if (!otp || !/^\d{6}$/.test(String(otp))) {
    return res.status(400).json({ message: 'OTP must be a 6-digit number.' });
  }

  return next();
};

const validateResendOTP = (req, res, next) => {
  const { email } = req.body;

  if (!email || !validateEmail(String(email).toLowerCase())) {
    return res.status(400).json({ message: 'A valid email is required.' });
  }

  return next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateVerifyOTP,
  validateResendOTP,
};
