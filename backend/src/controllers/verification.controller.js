const AdminVerification = require('../models/AdminVerification');
const User = require('../models/User');

exports.submit = async (req, res) => {
  try {
    const urls = (req.files || []).map((file) => `/uploads/kyc/${file.filename}`);
    const doc = await AdminVerification.create({
      userId: req.user._id,
      documentUrls: urls,
      documentType: req.body.documentType || 'trade_license',
      status: 'pending',
    });
    req.user.kycStatus = 'pending';
    await User.findByIdAndUpdate(req.user._id, { kycStatus: 'pending' });
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'KYC submit failed', error: error.message });
  }
};

exports.mine = async (req, res) => {
  const rows = await AdminVerification.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: rows });
};
