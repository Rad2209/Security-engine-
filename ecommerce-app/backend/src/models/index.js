/**
 * models/index.js
 *
 * Barrel export so the rest of the app can do:
 *   const { User, Admin, Product } = require('../models');
 * instead of requiring each model file individually.
 */
module.exports = {
  User: require('./User'),
  Admin: require('./Admin'),
  Category: require('./Category'),
  Product: require('./Product'),
  Review: require('./Review'),
  Cart: require('./Cart'),
  Order: require('./Order'),
};