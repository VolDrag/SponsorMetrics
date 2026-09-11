const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');
const { param, body } = require('express-validator');
const paymentController = require('../controllers/payment.controller');

router.get('/', authenticate, paymentController.listMine);
router.get('/callback', paymentController.callback);
router.post('/callback', paymentController.callback);
router.post('/webhook', paymentController.webhook);
router.get(
  '/:paymentId',
  authenticate,
  param('paymentId').isMongoId(),
  validate,
  paymentController.getById
);
router.post(
  '/:paymentId/release',
  authenticate,
  requireRole('admin'),
  param('paymentId').isMongoId(),
  validate,
  paymentController.release
);
router.post(
  '/:paymentId/refund',
  authenticate,
  requireRole('admin', 'sponsor'),
  param('paymentId').isMongoId(),
  body('reason').optional().isString(),
  validate,
  paymentController.refund
);

module.exports = router;
