const express = require('express');
const { listCategoriesHandler } = require('../controllers/categoryController');

const router = express.Router();

/**
 * Mounted at /api/categories in routes/index.js. Not part of the original
 * architecture doc's API list, but a necessary addition for a working
 * category filter dropdown on the product browsing page — same kind of
 * deliberate, flagged addition as BlockedAccounts was in the DB schema.
 */
router.get('/', listCategoriesHandler);

module.exports = router;