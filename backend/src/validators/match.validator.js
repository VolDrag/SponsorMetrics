const { param, query } = require('express-validator');

exports.discoverEventsValidation = [
  query('search').optional().isString().isLength({ max: 200 }),
  query('dateFilter').optional().isIn(['any', 'this_month', 'next_month']),
  query('budgetFilter').optional().isIn(['any', 'under_50k', '50k_to_2L', 'over_2L']),
];

exports.discoverSponsorsValidation = [
  param('eventId').isMongoId().withMessage('Invalid event ID'),
];
