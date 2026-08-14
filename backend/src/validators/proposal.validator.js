const { body, param } = require('express-validator');

// ========== MODULE 2 | Feature 1: Proposal Creator — START ==========
exports.createProposalValidation = [
  body('eventId')
    .notEmpty()
    .withMessage('Event is required')
    .isMongoId()
    .withMessage('Invalid event ID'),

  body('selectedTierId')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid tier ID'),

  body('sponsorId')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid sponsor ID'),

  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Notes cannot exceed 2000 characters'),

  body('goals')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Goals cannot exceed 1000 characters'),

  body('rawBulletPoints')
    .optional()
    .trim()
    .isLength({ max: 3000 })
    .withMessage('Bullet points cannot exceed 3000 characters'),

  body('body')
    .optional()
    .trim()
    .isLength({ max: 8000 })
    .withMessage('Proposal body cannot exceed 8000 characters'),

  body('aiGeneratedText')
    .optional()
    .trim()
    .isLength({ max: 8000 })
    .withMessage('AI text cannot exceed 8000 characters'),

  body('proposedBudget')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Proposed budget must be a non-negative number'),

  body('send').optional(),
];

exports.updateProposalValidation = [
  param('proposalId')
    .isMongoId()
    .withMessage('Invalid proposal ID'),

  body('eventId').optional().isMongoId().withMessage('Invalid event ID'),
  body('selectedTierId').optional({ nullable: true, checkFalsy: true }).isMongoId(),
  body('sponsorId').optional({ nullable: true, checkFalsy: true }).isMongoId(),
  body('notes').optional().trim().isLength({ max: 2000 }),
  body('goals').optional().trim().isLength({ max: 1000 }),
  body('rawBulletPoints').optional().trim().isLength({ max: 3000 }),
  body('body').optional().trim().isLength({ max: 8000 }),
  body('aiGeneratedText').optional().trim().isLength({ max: 8000 }),
  body('proposedBudget').optional().isFloat({ min: 0 }),
];

exports.proposalIdValidation = [
  param('proposalId')
    .isMongoId()
    .withMessage('Invalid proposal ID'),
];

exports.sendProposalValidation = [
  param('proposalId')
    .isMongoId()
    .withMessage('Invalid proposal ID'),

  body('sponsorId')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid sponsor ID'),
];

exports.aiAssistValidation = [
  body('bulletPoints')
    .trim()
    .notEmpty()
    .withMessage('Bullet points are required')
    .isLength({ max: 3000 })
    .withMessage('Bullet points cannot exceed 3000 characters'),

  body('proposalId')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid proposal ID'),

  body('eventId')
    .optional({ nullable: true, checkFalsy: true })
    .isMongoId()
    .withMessage('Invalid event ID'),

  body('notes').optional().trim().isLength({ max: 2000 }),
  body('goals').optional().trim().isLength({ max: 1000 }),
];
// ========== MODULE 2 | Feature 1: Proposal Creator — END ==========
