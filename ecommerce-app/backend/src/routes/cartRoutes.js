const express = require('express');
const {
  getCartHandler,
  addItemHandler,
  updateItemHandler,
  removeItemHandler,
  clearCartHandler,
} = require('../controllers/cartController');
const {
  productIdParamValidator,
  addItemValidators,
  updateQuantityValidators,
} = require('../validators/cartValidators');
const handleValidation = require('../validators/handleValidation');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Every cart route requires a logged-in customer — mounted once for the
// whole router rather than repeated on each individual route.
router.use(authMiddleware);

router.get('/', getCartHandler);
router.post('/', addItemValidators, handleValidation, addItemHandler);
router.put('/:productId', updateQuantityValidators, handleValidation, updateItemHandler);
router.delete('/:productId', productIdParamValidator, handleValidation, removeItemHandler);
router.delete('/', clearCartHandler);

module.exports = router;