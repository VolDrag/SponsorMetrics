const fs = require('fs');
const path = require('path');
const multer = require('multer');

// MODULE 2 | Feature 3 Event Editing — local multer storage for campaign photos
const uploadDir = path.join(__dirname, '../../uploads/campaigns');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext) ? ext : '.jpg';
    cb(null, `${req.params.campaignId}-${Date.now()}-${Math.round(Math.random() * 1e6)}${safeExt}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new Error('Only JPEG, PNG, GIF, or WebP images are allowed'));
};

const campaignPhotoUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
}).array('photos', 10);

exports.uploadDir = uploadDir;

exports.uploadCampaignPhotos = (req, res, next) => {
  campaignPhotoUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Image upload failed',
      });
    }
    next();
  });
};

// ===== MODULE 4 FEATURE 2: Post-Event Report & Approval Workflow — START =====
const reportDir = path.join(__dirname, '../../uploads/reports');
fs.mkdirSync(reportDir, { recursive: true });

const reportStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, reportDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const safeExt = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext) ? ext : '.jpg';
    cb(null, `${req.params.proposalId || 'report'}-${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e6)}${safeExt}`);
  },
});

const reportUpload = multer({
  storage: reportStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 20 },
}).fields([
  { name: 'crowdPhotos', maxCount: 10 },
  { name: 'engagementScreenshots', maxCount: 10 },
]);

exports.reportDir = reportDir;

exports.uploadReportPhotos = (req, res, next) => {
  reportUpload(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'Image upload failed',
      });
    }
    next();
  });
};
// ===== MODULE 4 FEATURE 2: Post-Event Report & Approval Workflow — END =====

