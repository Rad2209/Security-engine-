const { body } = require('express-validator');
const handleValidation = require('./handleValidation');

/**
 * authValidators
 *
 * STRUCTURAL validation only (is this a well-formed email? is the password
 * long enough?) — a completely different concern from the Security
 * Engine's THREAT detection (is this payload an attack?). Both run on the
 * same request, but for different reasons; see architecture doc §10 for why
 * they're kept as separate layers rather than merged into one module.
 */

const registerValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginValidators = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { registerValidators, loginValidators, handleValidation };