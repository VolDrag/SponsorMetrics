const TeamMember = require('../models/TeamMember');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const { notify } = require('../services/notification.service');

exports.invite = async (req, res) => {
  try {
    const permission = req.body.permission === 'negotiate' || req.body.permission === 'edit' || req.body.permission === 'admin'
      ? req.body.permission
      : 'view';
    const mapped = permission === 'negotiate' || permission === 'admin' ? 'edit' : 'view';
    const row = await TeamMember.create({
      sponsorOrgId: req.user._id,
      invitedEmail: String(req.body.email).toLowerCase(),
      name: req.body.name || '',
      permission: mapped,
      seatRole: permission,
      status: 'pending',
      activityLog: [{ action: `Invited by ${req.user.email}` }],
    });
    await ActivityLog.create({ orgId: req.user._id, actorId: req.user._id, action: `Invited ${row.invitedEmail} (${permission})` });
    const existing = await User.findOne({ email: row.invitedEmail });
    if (existing) {
      await notify(existing._id, 'team_invite', `${req.user.organizationName || req.user.name} invited you to their team.`, row._id);
    }
    res.status(201).json({ success: true, data: row });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Invite failed', error: error.message });
  }
};

exports.list = async (req, res) => {
  const rows = await TeamMember.find({ sponsorOrgId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, data: rows });
};

exports.revoke = async (req, res) => {
  const row = await TeamMember.findOne({ _id: req.params.memberId, sponsorOrgId: req.user._id });
  if (!row) return res.status(404).json({ success: false, message: 'Member not found' });
  row.status = 'revoked';
  row.activityLog.push({ action: 'Access revoked' });
  await row.save();
  await ActivityLog.create({ orgId: req.user._id, actorId: req.user._id, action: `Revoked ${row.invitedEmail}` });
  res.json({ success: true, data: row });
};

exports.activity = async (req, res) => {
  const rows = await ActivityLog.find({ orgId: req.user._id }).sort({ createdAt: -1 }).limit(100);
  res.json({ success: true, data: rows });
};
