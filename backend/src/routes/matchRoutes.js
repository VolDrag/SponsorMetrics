// Rafi
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const matchController = require('../controllers/match.controller');
const {
  discoverEventsValidation,
  discoverSponsorsValidation,
} = require('../validators/match.validator');

router.get(
  '/events',
  authenticate,
  discoverEventsValidation,
  validate,
  matchController.discoverEvents
);

router.get(
  '/sponsors/:eventId',
  authenticate,
  discoverSponsorsValidation,
  validate,
  matchController.discoverSponsors
);

module.exports = router;
// Rafi end
