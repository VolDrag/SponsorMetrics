// ifty
const express = require('express');

// 1. Destructure authenticate here
const { authenticate } = require('../middleware/auth'); 
const { requireRole } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');
const {
  createTierValidation,
  updateTierValidation,
  tierIdValidation,
  eventIdParamValidation,
} = require('../validators/tier.validator');
const {
  createTier,
  getTiersByEvent,
  updateTier,
  deleteTier,
  getOrganizerEvents,
} = require('../controllers/tier.controller');

const router = express.Router();

router.get('/events/mine', authenticate, requireRole('organizer'), getOrganizerEvents);
router.get('/event/:eventId', authenticate, eventIdParamValidation, validate, getTiersByEvent);
router.post('/', authenticate, requireRole('organizer'), createTierValidation, validate, createTier);
router.put('/:tierId', authenticate, requireRole('organizer'), updateTierValidation, validate, updateTier);
router.delete('/:tierId', authenticate, requireRole('organizer'), tierIdValidation, validate, deleteTier);

module.exports = router;
// ifty end