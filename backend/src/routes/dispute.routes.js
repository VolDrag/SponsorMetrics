const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');
const { param, body } = require('express-validator');
const disputeController = require('../controllers/dispute.controller');

router.post('/', authenticate, body('campaignId').isMongoId(), body('reason').trim().notEmpty(), validate, disputeController.create);
router.get('/', authenticate, disputeController.list);
router.post(
  '/:disputeId/comment',
  authenticate,
  param('disputeId').isMongoId(),
  body('message').trim().notEmpty(),
  validate,
  disputeController.comment
);
router.post(
  '/:disputeId/resolve',
  authenticate,
  requireRole('admin'),
  param('disputeId').isMongoId(),
  body('action').isIn(['release', 'refund', 'closed']),
  validate,
  disputeController.resolve
);

module.exports = router;
