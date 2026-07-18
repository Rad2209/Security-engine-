const { body, param } = require('express-validator');

const productIdParamValidator = [param('productId').isMongoId().withMessage('Invalid product id')];

const addItemValidators = [
  body('productId').isMongoId().withMessage('Invalid product id'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1').toInt(),
];

const updateQuantityValidators = [
  ...productIdParamValidator,
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1').toInt(),
];

module.exports = { addItemValidators, updateQuantityValidators, productIdParamValidator };