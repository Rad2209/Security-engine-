const express = require('express');
const authRoutes = require('./authRoutes');
const adminRoutes = require('./adminRoutes');
const categoryRoutes = require('./categoryRoutes');
const productRoutes = require('./productRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const contactRoutes = require('./contactRoutes');
const { success } = require('../utils/apiResponse');

const router = express.Router();

router.get('/health', (req, res) => {
  success(res, { status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/contact', contactRoutes);

module.exports = router;