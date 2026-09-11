const express = require('express');
const router = express.Router();
const { analyzeProposalStrength, getProposalStrength } = require('../controllers/analyzerController');
const proposalController = require('../controllers/proposal.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');
const { validate } = require('../middleware/validate');
const { sendLimiter, aiLimiter } = require('../middleware/rateLimit');
const {
  createProposalValidation,
  updateProposalValidation,
  proposalIdValidation,
  sendProposalValidation,
  aiAssistValidation,
  counterOfferValidation, // MODULE 2 | Feature 2
} = require('../validators/proposal.validator');
const {
  analyzeValidation,
  eventIdParamValidation: analyzerEventIdValidation,
} = require('../validators/analyzer.validator');

// Module 1 — Proposal Strength Analyzer (MODULE 9: auth + validation)
router.post(
  '/analyze',
  authenticate,
  requireRole('organizer'),
  analyzeValidation,
  validate,
  analyzeProposalStrength
);

// ========== MODULE 2 | Feature 1: Proposal Creator — START ==========
router.post(
  '/ai-assist',
  authenticate,
  requireRole('organizer'),
  aiLimiter,
  aiAssistValidation,
  validate,
  proposalController.aiAssist
);

router.get(
  '/my-proposals',
  authenticate,
  requireRole('organizer'),
  proposalController.getMyProposals
);

router.get(
  '/sponsors',
  authenticate,
  requireRole('organizer'),
  proposalController.getSponsors
);
// ========== MODULE 2 | Feature 1: Proposal Creator — END ==========

// ========== MODULE 2 | Feature 2: Proposal Review & In-Platform Negotiation — START ==========
router.get(
  '/inbox',
  authenticate,
  requireRole('sponsor'),
  proposalController.getInbox
);
// ========== MODULE 2 | Feature 2 — END (more Feature 2 routes below) ==========

// ========== MODULE 2 | Feature 4: Proposal Status Tracker — START ==========
router.get(
  '/pipeline',
  authenticate,
  requireRole('organizer'),
  proposalController.getPipeline
);
// ========== MODULE 2 | Feature 4: Proposal Status Tracker — END ==========

// ========== MODULE 2 | Feature 1: Proposal Creator — START ==========
router.post(
  '/',
  authenticate,
  requireRole('organizer'),
  createProposalValidation,
  validate,
  proposalController.createProposal
);

router.get(
  '/:proposalId',
  authenticate,
  proposalIdValidation,
  validate,
  proposalController.getProposalById // Feature 2 also uses this (marks viewed)
);

router.put(
  '/:proposalId',
  authenticate,
  requireRole('organizer'),
  updateProposalValidation,
  validate,
  proposalController.updateProposal
);

router.post(
  '/:proposalId/send',
  authenticate,
  requireRole('organizer'),
  sendLimiter,
  sendProposalValidation,
  validate,
  proposalController.sendProposal
);
// ========== MODULE 2 | Feature 1: Proposal Creator — END ==========

// ========== MODULE 2 | Feature 2: Proposal Review & In-Platform Negotiation — START ==========
router.post(
  '/:proposalId/counter-offer',
  authenticate,
  proposalIdValidation,
  counterOfferValidation,
  validate,
  proposalController.counterOffer
);

router.post(
  '/:proposalId/accept',
  authenticate,
  proposalIdValidation,
  validate,
  proposalController.acceptProposal
);

router.post(
  '/:proposalId/reject',
  authenticate,
  proposalIdValidation,
  validate,
  proposalController.rejectProposal
);
// ========== MODULE 2 | Feature 2: Proposal Review & In-Platform Negotiation — END ==========

// Module 1 — keep analyzer lookup after specific Module 2 paths
router.get('/:eventId/strength', authenticate, analyzerEventIdValidation, validate, getProposalStrength);

module.exports = router;
