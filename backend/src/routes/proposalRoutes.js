const express = require('express');
const router = express.Router();
const { analyzeProposalStrength, getProposalStrength } = require('../controllers/analyzerController');

router.post('/analyze', analyzeProposalStrength);
router.get('/:eventId/strength', getProposalStrength);

module.exports = router;
