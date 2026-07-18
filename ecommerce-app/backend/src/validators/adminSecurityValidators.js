const { query, param } = require('express-validator');

/**
 * Structural validation for the admin log-filtering screen. `type` is
 * restricted to the engine's actual attack-type enum so a typo'd filter
 * fails loudly with 422 rather than silently returning zero (mistakenly
 * correct-looking) results.
 */
const listLogsValidators = [
  query('type')
    .optional()
    .isIn(['SQL_INJECTION', 'XSS', 'BRUTE_FORCE'])
    .withMessage('type must be one of SQL_INJECTION, XSS, BRUTE_FORCE'),
  query('ip').optional().trim().isLength({ max: 45 }).withMessage('Invalid ip filter'), // 45 = max IPv6 string length
  query('from').optional().isISO8601().withMessage('from must be a valid ISO date').toDate(),
  query('to').optional().isISO8601().withMessage('to must be a valid ISO date').toDate(),
  query('limit').optional().isInt({ min: 1, max: 200 }).withMessage('limit must be between 1 and 200').toInt(),
];

const ipParamValidator = [param('ip').trim().notEmpty().withMessage('IP is required')];

module.exports = { listLogsValidators, ipParamValidator };