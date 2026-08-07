// ifty
const express = require('express');

const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const {
  createTier,
  getTiersByEvent,
  updateTier,
  deleteTier,
  getOrganizerEvents,
} = require('../controllers/tier.controller');

const router = express.Router();

router.get('/events/mine', auth, roleCheck('organizer'), getOrganizerEvents);
router.get('/event/:eventId', auth, getTiersByEvent);
router.post('/', auth, roleCheck('organizer'), createTier);
router.put('/:tierId', auth, roleCheck('organizer'), updateTier);
router.delete('/:tierId', auth, roleCheck('organizer'), deleteTier);

module.exports = router;
// ifty end
