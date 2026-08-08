const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const matchController = require('../controllers/match.controller');

// Sponsor looking for events
router.get('/events', authenticate, matchController.discoverEvents);

// Organizer looking for sponsors for a specific event
router.get('/sponsors/:eventId', authenticate, matchController.discoverSponsors);

module.exports = router;
