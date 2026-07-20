const express = require('express');
// const { registerHandler, loginHandler, logoutHandler } = require('../controllers/authController');
const {
  registerValidators,
  loginValidators,
  handleValidation,
} = require('../validators/authValidators');

const { registerHandler, loginHandler, logoutHandler, meHandler } = require('../controllers/authController');
// ... (registerValidators/loginValidators/handleValidation import unchanged)
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * Note: this router is mounted at /api/auth in routes/index.js, so this
 * file's '/login' becomes '/api/auth/login' — which is exactly the path
 * listed in the Security Engine's default `protectedRoutes` config
 * (security-engine/src/config/defaultConfig.js). If this mount point ever
 * changes, that config must be updated too, or brute-force tracking silently
 * stops applying to login.
 */
router.post('/register', registerValidators, handleValidation, registerHandler);
router.post('/login', loginValidators, handleValidation, loginHandler);
router.post('/logout', logoutHandler);
// ... existing routes, then add:
router.get('/me', authMiddleware, meHandler);


module.exports = router;