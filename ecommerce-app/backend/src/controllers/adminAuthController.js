const adminAuthService = require('../services/adminAuthService');
const BruteForceDetector = require('security-engine/src/detectors/BruteForceDetector');
const securityAdapter = require('../middleware/securityAdapter');
const { success, error } = require('../utils/apiResponse');
const env = require('../config/env');

const COOKIE_NAME = 'adminToken';
const isProduction = env.NODE_ENV === 'production';

/**
 * Same cookie-flag reasoning as authController.js (httpOnly always; secure +
 * sameSite=None only in production). Separate constant/name from the
 * customer cookie so both sessions can coexist in the same browser without
 * collision.
 */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 60 * 60 * 1000,
};

async function adminLoginHandler(req, res, next) {
  const { email, password } = req.body;
  const ip = req.ip;

  try {
    const admin = await adminAuthService.validateAdminCredentials({ email, password });

    if (!admin) {
      // IMPORTANT: identifier must be the bare email, matching exactly what
      // SecurityEngine's gate-keeping uses internally (it reads
      // req.body.email directly — see core/SecurityEngine.js). Reporting
      // under a different identifier (e.g. a "admin:" prefix) would cause
      // the count this call increments to never match the count the gate
      // reads before the NEXT request, silently breaking account-level
      // blocking. Known limitation: if an admin and a customer ever share
      // the same email, their failed-attempt counts are shared too, since
      // the engine has no concept of "route namespace" for identifiers.
      await BruteForceDetector.recordFailure({ ip, identifier: email }, securityAdapter);
      return error(res, 'Invalid email or password', 401);
    }

    await BruteForceDetector.recordSuccess({ ip, identifier: email }, securityAdapter);

    const token = adminAuthService.signAdminToken(admin);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    return success(res, { id: admin._id, name: admin.name, email: admin.email });
  } catch (err) {
    return next(err);
  }
}

function adminLogoutHandler(req, res) {
  const { maxAge, ...clearOptions } = COOKIE_OPTIONS;
  res.clearCookie(COOKIE_NAME, clearOptions);
  return success(res, { message: 'Logged out' });
}

async function adminMeHandler(req, res, next) {
  try {
    const admin = await adminAuthService.getAdminById(req.admin.id);

    if (!admin) {
      return error(res, 'Admin not found', 404);
    }

    return success(res, { id: admin._id, name: admin.name, email: admin.email });
  } catch (err) {
    return next(err);
  }
}

module.exports = { adminLoginHandler, adminLogoutHandler, adminMeHandler, COOKIE_NAME, COOKIE_OPTIONS };