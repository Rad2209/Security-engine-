const express = require('express');
// const { adminLoginHandler, adminLogoutHandler } = require('../controllers/adminAuthController');
const { listUsersHandler } = require('../controllers/adminUserController');
const { listAllProductsHandler } = require('../controllers/adminProductController');
const {
  listLogsHandler,
  listBlockedIpsHandler,
  unblockIpHandler,
  getStatsHandler,
} = require('../controllers/adminSecurityController');
const { loginValidators } = require('../validators/authValidators');
const { listLogsValidators, ipParamValidator } = require('../validators/adminSecurityValidators');
const handleValidation = require('../validators/handleValidation');
const adminAuthMiddleware = require('../middleware/adminAuthMiddleware');
const { adminLoginHandler, adminLogoutHandler, adminMeHandler } = require('../controllers/adminAuthController');

// ...

const router = express.Router();

/**
 * Mounted at /api/admin in routes/index.js. '/login' and '/logout' stay
 * public (login obviously must be, logout matches the same
 * always-succeeds-on-clear pattern as the customer version). Every route
 * below router.use(adminAuthMiddleware) requires a verified admin session
 * — Express applies router.use() middleware only to routes registered
 * AFTER it in the same router, so login/logout are correctly excluded.
 *
 */

router.post('/login', loginValidators, handleValidation, adminLoginHandler);
router.post('/logout', adminLogoutHandler);
router.get('/blocked-accounts', listBlockedAccountsHandler);

// router.use(adminAuthMiddleware);
router.use(adminAuthMiddleware);

router.get('/me', adminMeHandler);
router.get('/users', listUsersHandler);
// ... rest unchanged

router.get('/users', listUsersHandler);
router.get('/products', listAllProductsHandler);
router.get('/logs', listLogsValidators, handleValidation, listLogsHandler);
router.get('/blocked-ips', listBlockedIpsHandler);
router.patch('/blocked-ips/:ip/unblock', ipParamValidator, handleValidation, unblockIpHandler);
router.get('/stats', getStatsHandler);
router.patch(
  '/blocked-accounts/:identifier/unblock',
  identifierParamValidator,
  handleValidation,
  unblockAccountHandler
);

module.exports = router;