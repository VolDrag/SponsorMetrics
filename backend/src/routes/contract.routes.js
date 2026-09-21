const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { param, body } = require('express-validator');
const contractController = require('../controllers/contract.controller');

router.get('/', authenticate, contractController.listMine);
router.get(
  '/:contractId/pdf',
  authenticate,
  param('contractId').isMongoId(),
  validate,
  contractController.downloadPdf
);
router.get(
  '/:contractId',
  authenticate,
  param('contractId').isMongoId(),
  validate,
  contractController.getById
);
router.post(
  '/:contractId/sign',
  authenticate,
  param('contractId').isMongoId(),
  body('fullName').trim().notEmpty().withMessage('Typed full name is required'),
  validate,
  contractController.sign
);

module.exports = router;
