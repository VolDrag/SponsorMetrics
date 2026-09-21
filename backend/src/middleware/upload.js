const fs = require('fs');
const path = require('path');
const multer = require('multer');

const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const ALLOWED_MIME = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const FILE_SIZE_CAP = Number(process.env.UPLOAD_MAX_BYTES || 5 * 1024 * 1024);

const matchesMagic = (header) => {
  if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) return 'jpeg';
  if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4e && header[3] === 0x47) return 'png';
  if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46 && header[3] === 0x38) return 'gif';
  if (header.slice(0, 4).toString('ascii') === 'RIFF' && header.slice(8, 12).toString('ascii') === 'WEBP') {
    return 'webp';
  }
  return null;
};

const assertSafeImage = async (filePath) => {
  const fd = fs.openSync(filePath, 'r');
  const header = Buffer.alloc(16);
  fs.readSync(fd, header, 0, 16, 0);
  fs.closeSync(fd);
  if (!matchesMagic(header)) {
    throw new Error('File content is not an allowed image type');
  }
  const sharp = require('sharp');
  const meta = await sharp(filePath).metadata();
  if (!['jpeg', 'png', 'gif', 'webp'].includes(meta.format)) {
    throw new Error('Unsupported image format');
  }
};

const collectedFiles = (req) => {
  if (Array.isArray(req.files)) return req.files;
  if (req.files && typeof req.files === 'object') {
    return Object.values(req.files).flat();
  }
  return req.file ? [req.file] : [];
};

exports.scanUploadedImages = async (req, res, next) => {
  const files = collectedFiles(req);
  try {
    for (const file of files) {
      await assertSafeImage(file.path);
    }
    next();
  } catch (error) {
    files.forEach((file) => {
      try {
        fs.unlinkSync(file.path);
      } catch (_err) {
        /* already gone */
      }
    });
    return res.status(400).json({
      success: false,
      message: error.message || 'Image failed the upload scan',
    });
  }
};

exports.blockNonImageUploads = (req, res, next) => {
  const requestPath = `${req.baseUrl || ''}${req.path || ''}` || req.originalUrl || '';
  const ext = path.extname(requestPath.split('?')[0] || '').toLowerCase();
  const pdfOk = /\.pdf$/i.test(requestPath) && /(invoices|contracts|reports-white)/i.test(requestPath);
  if (ext && !ALLOWED_EXT.includes(ext) && !pdfOk) {
    return res.status(404).json({ success: false, message: 'Not found' });
  }
  next();
};

// MODULE 2 | Feature 3 Event Editing — local multer storage for campaign photos
const uploadDir = path.join(__dirname, '../../uploads/campaigns');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    const safeExt = ALLOWED_EXT.includes(ext) ? ext : '.jpg';
    cb(null, `${req.params.campaignId}-${Date.now()}-${Math.round(Math.random() * 1e6)}${safeExt}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (ALLOWED_MIME.includes(file.mimetype) && (!ext || ALLOWED_EXT.includes(ext))) {
    cb(null, true);
    return;
  }
  cb(new Error('Only JPEG, PNG, GIF, or WebP images are allowed'));
};

const campaignPhotoUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: FILE_SIZE_CAP, files: 10 },
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
    const safeExt = ALLOWED_EXT.includes(ext) ? ext : '.jpg';
    cb(null, `${req.params.proposalId || 'report'}-${file.fieldname}-${Date.now()}-${Math.round(Math.random() * 1e6)}${safeExt}`);
  },
});

const reportUpload = multer({
  storage: reportStorage,
  fileFilter,
  limits: { fileSize: FILE_SIZE_CAP, files: 20 },
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

const kycDir = path.join(__dirname, '../../uploads/kyc');
fs.mkdirSync(kycDir, { recursive: true });
const kycUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, kycDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
      const safeExt = ALLOWED_EXT.includes(ext) ? ext : '.jpg';
      cb(null, `${req.user._id}-${Date.now()}${safeExt}`);
    },
  }),
  fileFilter,
  limits: { fileSize: FILE_SIZE_CAP, files: 5 },
}).array('documents', 5);

exports.uploadKycDocs = (req, res, next) => {
  kycUpload(req, res, (err) => {
    if (err) return res.status(400).json({ success: false, message: err.message || 'Upload failed' });
    next();
  });
};


