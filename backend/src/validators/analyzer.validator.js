const { body, param } = require('express-validator');

exports.analyzeValidation = [
  body('eventId').optional().isMongoId().withMessage('Invalid event ID'),
  body('name').optional().isString().isLength({ max: 200 }),
  body('expectedCrowdSize').optional().isFloat({ min: 0 }),
  body('budget').optional().isFloat({ min: 0 }),
  body('description').optional().isString().isLength({ max: 8000 }),
  body('rawBulletPoints').optional().isString().isLength({ max: 8000 }),
  body('venue').optional().isString().isLength({ max: 300 }),
  body('socialMediaReach').optional().isFloat({ min: 0 }),
];

exports.eventIdParamValidation = [param('eventId').isMongoId().withMessage('Invalid event ID')];
