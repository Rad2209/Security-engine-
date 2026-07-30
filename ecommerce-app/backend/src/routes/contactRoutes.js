const express = require('express');
const { submitContactHandler, subscribeHandler } = require('../controllers/contactController');
const {
  submitContactValidators,
  subscribeValidators,
} = require('../validators/contactValidators');
const handleValidation = require('../validators/handleValidation');

const router = express.Router();

router.post('/', submitContactValidators, handleValidation, submitContactHandler);
router.post('/subscribe', subscribeValidators, handleValidation, subscribeHandler);

module.exports = router;
