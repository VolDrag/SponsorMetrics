const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { uploadKycDocs, scanUploadedImages } = require('../middleware/upload');
const verificationController = require('../controllers/verification.controller');

router.get('/', authenticate, verificationController.mine);
router.post('/', authenticate, uploadKycDocs, scanUploadedImages, verificationController.submit);

module.exports = router;
