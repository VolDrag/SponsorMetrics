const express = require('express');
const router = express.Router();
const { analyzeProposalStrength, getProposalStrength } = require('../controllers/analyzerController');
const proposalController = require('../controllers/proposal.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');
const {
  createProposalValidation,
  updateProposalValidation,
  proposalIdValidation,
  sendProposalValidation,
  aiAssistValidation,
  counterOfferValidation, // MODULE 2 | Feature 2
} = require('../validators/proposal.validator');

// Module 1 — Proposal Strength Analyzer
router.post('/analyze', analyzeProposalStrength);


// ========== MODULE 2 | Feature 4: Proposal Status Tracker — START ==========
router.get(
  '/pipeline',
  authenticate,
  requireRole('organizer'),
  proposalController.getPipeline
);
// ========== MODULE 2 | Feature 4: Proposal Status Tracker — END ==========
