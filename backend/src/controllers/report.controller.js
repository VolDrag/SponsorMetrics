const PostEventMetrics = require('../models/PostEventMetrics');
const Proposal = require('../models/Proposal');
const { inspectImage } = require('../services/forensics.service');

// ===== MODULE 4 FEATURE 2: Post-Event Report & Approval Workflow — START =====
const POPULATE = [
  { path: 'eventId', select: 'name date venue organizerId' },
  { path: 'proposalId', select: 'organizerId sponsorId proposedBudget status selectedTierId' },
  { path: 'reviewComments.authorId', select: 'name organizationName role' },
  { path: 'signOff.sponsorId', select: 'name organizationName' },
];

const publicUrl = (filename) => `/uploads/reports/${filename}`;

const toPhotoDocs = async (files = [], eventId) => {
  const docs = [];
  for (const file of files) {
    const mediaForensicsResult = await inspectImage(file.path, eventId);
    docs.push({
      url: publicUrl(file.filename),
      mediaForensicsResult,
    });
  }
  return docs;
};

const findAccessibleReport = async (proposalId, user) => {
  const proposal = await Proposal.findById(proposalId);
  if (!proposal) return { error: { statusCode: 404, message: 'Proposal not found' } };

  const userId = String(user._id);
  const isOrganizer = String(proposal.organizerId) === userId;
  const isSponsor = proposal.sponsorId && String(proposal.sponsorId) === userId;
  if (!isOrganizer && !isSponsor && user.role !== 'admin') {
    return { error: { statusCode: 403, message: 'You do not have permission to access this report' } };
  }
  return { proposal, isOrganizer, isSponsor };
};

const isLocked = (report) => report?.status === 'Approved';

const getOrCreateDraft = async (proposal) => {
  let report = await PostEventMetrics.findOne({ proposalId: proposal._id });
  if (report) return report;
  report = await PostEventMetrics.create({
    eventId: proposal.eventId,
    proposalId: proposal._id,
    totalReach: 0,
    totalEngagement: 0,
    attendeeCount: 0,
    status: 'Draft',
  });
  return report;
};

exports.getReport = async (req, res) => {
  try {
    const { proposal, isSponsor, error } = await findAccessibleReport(req.params.proposalId, req.user);
    if (error) return res.status(error.statusCode).json({ success: false, message: error.message });

    let report = await PostEventMetrics.findOne({ proposalId: proposal._id });
    if (!report && req.user.role === 'organizer') {
      report = await getOrCreateDraft(proposal);
    }
    if (!report) {
      return res.status(404).json({ success: false, message: 'No post-event report yet' });
    }

    if (isSponsor && report.status === 'Submitted') {
      report.status = 'Under Review';
      await report.save();
    }

    const populated = await PostEventMetrics.findById(report._id).populate(POPULATE);
    res.status(200).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to load report', error: error.message });
  }
};

exports.listSponsorReports = async (req, res) => {
  try {
    const proposals = await Proposal.find({ sponsorId: req.user._id, status: 'accepted' }).select('_id');
    const reports = await PostEventMetrics.find({
      proposalId: { $in: proposals.map((row) => row._id) },
      status: { $in: ['Submitted', 'Under Review', 'Revision Requested', 'Approved'] },
    })
      .populate(POPULATE)
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, count: reports.length, data: reports });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to list reports', error: error.message });
  }
};

exports.saveReport = async (req, res) => {
  try {
    const { proposal, isOrganizer, error } = await findAccessibleReport(req.params.proposalId, req.user);
    if (error) return res.status(error.statusCode).json({ success: false, message: error.message });
    if (!isOrganizer) {
      return res.status(403).json({ success: false, message: 'Only the organizer can edit this report' });
    }

    const report = await getOrCreateDraft(proposal);
    if (isLocked(report)) {
      return res.status(400).json({ success: false, message: 'Approved reports are archived and cannot be edited' });
    }
    if (!['Draft', 'Revision Requested'].includes(report.status)) {
      return res.status(400).json({
        success: false,
        message: 'This report is under sponsor review. Wait for a revision request before editing.',
      });
    }

    if (req.body.totalReach !== undefined) report.totalReach = Number(req.body.totalReach);
    if (req.body.totalEngagement !== undefined) report.totalEngagement = Number(req.body.totalEngagement);
    if (req.body.attendeeCount !== undefined) report.attendeeCount = Number(req.body.attendeeCount);

    const crowdFiles = req.files?.crowdPhotos || [];
    const shotFiles = req.files?.engagementScreenshots || [];
    if (crowdFiles.length) {
      report.crowdPhotos.push(...(await toPhotoDocs(crowdFiles, proposal.eventId)));
    }
    if (shotFiles.length) {
      report.engagementScreenshots.push(...(await toPhotoDocs(shotFiles, proposal.eventId)));
    }

    report.submittedAt = new Date();
    await report.save();

    const populated = await PostEventMetrics.findById(report._id).populate(POPULATE);
    res.status(200).json({ success: true, message: 'Report saved', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to save report', error: error.message });
  }
};

exports.submitReport = async (req, res) => {
  try {
    const { proposal, isOrganizer, error } = await findAccessibleReport(req.params.proposalId, req.user);
    if (error) return res.status(error.statusCode).json({ success: false, message: error.message });
    if (!isOrganizer) {
      return res.status(403).json({ success: false, message: 'Only the organizer can submit this report' });
    }

    const report = await PostEventMetrics.findOne({ proposalId: proposal._id });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Save numbers and photos before submitting' });
    }
    if (isLocked(report)) {
      return res.status(400).json({ success: false, message: 'Approved reports are archived' });
    }
    if (!['Draft', 'Revision Requested'].includes(report.status)) {
      return res.status(400).json({ success: false, message: 'This report is already with the sponsor' });
    }

    report.status = 'Submitted';
    report.submittedAt = new Date();
    await report.save();

    const populated = await PostEventMetrics.findById(report._id).populate(POPULATE);
    res.status(200).json({ success: true, message: 'Report submitted for sponsor review', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to submit report', error: error.message });
  }
};

exports.approveReport = async (req, res) => {
  try {
    const { proposal, isSponsor, error } = await findAccessibleReport(req.params.proposalId, req.user);
    if (error) return res.status(error.statusCode).json({ success: false, message: error.message });
    if (!isSponsor) {
      return res.status(403).json({ success: false, message: 'Only the assigned sponsor can approve this report' });
    }

    const report = await PostEventMetrics.findOne({ proposalId: proposal._id });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    if (isLocked(report)) {
      return res.status(400).json({ success: false, message: 'This report is already approved' });
    }

    report.status = 'Approved';
    report.signOff = { sponsorId: req.user._id, approvedAt: new Date() };
    await report.save();

    const populated = await PostEventMetrics.findById(report._id).populate(POPULATE);
    res.status(200).json({ success: true, message: 'Report approved and archived', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to approve report', error: error.message });
  }
};

exports.requestRevision = async (req, res) => {
  try {
    const { proposal, isSponsor, error } = await findAccessibleReport(req.params.proposalId, req.user);
    if (error) return res.status(error.statusCode).json({ success: false, message: error.message });
    if (!isSponsor) {
      return res.status(403).json({ success: false, message: 'Only the assigned sponsor can request a revision' });
    }
    if (!req.body.comment || !String(req.body.comment).trim()) {
      return res.status(400).json({ success: false, message: 'A revision comment is required' });
    }

    const report = await PostEventMetrics.findOne({ proposalId: proposal._id });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    if (isLocked(report)) {
      return res.status(400).json({ success: false, message: 'Approved reports cannot be sent back' });
    }

    report.status = 'Revision Requested';
    report.reviewComments.push({
      authorId: req.user._id,
      role: 'sponsor',
      comment: String(req.body.comment).trim(),
      createdAt: new Date(),
    });
    await report.save();

    const populated = await PostEventMetrics.findById(report._id).populate(POPULATE);
    res.status(200).json({ success: true, message: 'Revision requested', data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to request revision', error: error.message });
  }
};
// ===== MODULE 4 FEATURE 2: Post-Event Report & Approval Workflow — END =====
