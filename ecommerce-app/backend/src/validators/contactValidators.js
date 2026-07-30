const { body } = require('express-validator');

const submitContactValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('message').trim().notEmpty().withMessage('Message is required'),
];

const subscribeValidators = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
];

module.exports = { submitContactValidators, subscribeValidators };
