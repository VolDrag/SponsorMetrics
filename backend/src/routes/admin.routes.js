const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');
const { param, body } = require('express-validator');
const adminController = require('../controllers/admin.controller');

router.use(authenticate, requireRole('admin'));
router.get('/dashboard', adminController.dashboard);
router.get('/kyc', adminController.kycQueue);
router.post(
  '/kyc/:verificationId',
  param('verificationId').isMongoId(),
  body('decision').isIn(['approved', 'rejected']),
  validate,
  adminController.reviewKyc
);
router.get('/flagged-proposals', adminController.flaggedProposals);
router.get('/flagged-photos', adminController.flaggedPhotos);
router.post('/payments/:paymentId/release', param('paymentId').isMongoId(), validate, adminController.releasePayment);
router.post('/payments/:paymentId/refund', param('paymentId').isMongoId(), validate, adminController.refundPayment);

module.exports = router;
