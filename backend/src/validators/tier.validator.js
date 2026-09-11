const { body, param } = require('express-validator');

exports.createTierValidation = [
  body('eventId').isMongoId().withMessage('Invalid event ID'),
  body('name').trim().notEmpty().withMessage('Tier name is required').isLength({ max: 80 }),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('isCustom').optional().isBoolean(),
  body('formatType').optional().isIn(['banner', 'booth', 'speaking_slot', 'social_post', 'other']),
  body('benefits').optional().isArray(),
  body('benefits.*.label').optional().trim().notEmpty(),
  body('benefits.*.detail').optional().trim().notEmpty(),
];

exports.updateTierValidation = [
  param('tierId').isMongoId().withMessage('Invalid tier ID'),
  body('name').optional().trim().notEmpty().isLength({ max: 80 }),
  body('price').optional().isFloat({ min: 0 }),
  body('isCustom').optional().isBoolean(),
  body('formatType').optional().isIn(['banner', 'booth', 'speaking_slot', 'social_post', 'other']),
  body('benefits').optional().isArray(),
];

exports.tierIdValidation = [param('tierId').isMongoId().withMessage('Invalid tier ID')];
exports.eventIdParamValidation = [param('eventId').isMongoId().withMessage('Invalid event ID')];
