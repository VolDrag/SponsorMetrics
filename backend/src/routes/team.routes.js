const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { body, param } = require('express-validator');
const teamController = require('../controllers/team.controller');

router.get('/', authenticate, teamController.list);
router.get('/activity', authenticate, teamController.activity);
router.post(
  '/invite',
  authenticate,
  body('email').isEmail(),
  body('permission').optional().isIn(['view', 'negotiate', 'admin', 'edit']),
  validate,
  teamController.invite
);
router.post('/:memberId/revoke', authenticate, param('memberId').isMongoId(), validate, teamController.revoke);

module.exports = router;
