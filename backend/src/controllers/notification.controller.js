const Notification = require('../models/Notification');

exports.list = async (req, res) => {
  const rows = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
  const unread = rows.filter((row) => !row.isRead).length;
  res.json({ success: true, data: { items: rows, unread } });
};

exports.markRead = async (req, res) => {
  await Notification.updateMany(
    req.body.id ? { _id: req.body.id, userId: req.user._id } : { userId: req.user._id, isRead: false },
    { isRead: true }
  );
  res.json({ success: true });
};
