const express = require('express');
const { checkoutHandler, listOrdersHandler } = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', checkoutHandler);
router.get('/', listOrdersHandler);

module.exports = router;