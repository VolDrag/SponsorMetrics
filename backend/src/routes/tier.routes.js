// ifty
const express = require('express');

const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const {
  createTier,
  getTiersByEvent,
  updateTier,
  deleteTier,
  getOrganizerEvents,
} = require('../controllers/tier.controller');

const router = express.Router();

router.get('/events/mine', authenticate, requireRole('organizer'), getOrganizerEvents);
router.get('/event/:eventId', authenticate, getTiersByEvent);
router.post('/', authenticate, requireRole('organizer'), createTier);
router.put('/:tierId', authenticate, requireRole('organizer'), updateTier);
router.delete('/:tierId', authenticate, requireRole('organizer'), deleteTier);

module.exports = router;
// ifty end
