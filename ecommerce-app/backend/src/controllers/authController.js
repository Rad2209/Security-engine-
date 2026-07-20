const authService = require('../services/authService');
const BruteForceDetector = require('security-engine/src/detectors/BruteForceDetector');
const securityAdapter = require('../middleware/securityAdapter');
const { success, error } = require('../utils/apiResponse');
const env = require('../config/env');

const COOKIE_NAME = 'token';
const isProduction = env.NODE_ENV === 'production';

/**
 * Cookie flags:
 * - httpOnly: JavaScript can never read this cookie, even via a successful
 *   XSS payload that slips past the detector — this is WHY the cookie
 *   approach was chosen over localStorage (Phase 1 §9).
 * - secure + sameSite=None only in production, where frontend (Vercel) and
 *   backend (Render) are genuinely cross-origin. Browsers reject
 *   SameSite=None without Secure, so the two must change together.
 *   Locally, sameSite=Lax + secure=false works fine since the browser
 *   treats localhost as a single, non-HTTPS context.
 */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  maxAge: 60 * 60 * 1000, // 1 hour — matches authService.TOKEN_EXPIRY
};

async function registerHandler(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const user = await authService.register({ name, email, password });
    return success(res, { id: user._id, name: user.name, email: user.email }, 201);
  } catch (err) {
    return next(err);
  }
}

async function loginHandler(req, res, next) {
  const { email, password } = req.body;
  const ip = req.ip;

  try {
    const user = await authService.validateCredentials({ email, password });

    if (!user) {
      // Explicit report to the engine after a failed login — this is the
      // mechanism agreed in Phase 1 §12 item 1 / documented on
      // BruteForceDetector.recordFailure(): the engine can't see whether a
      // login succeeded since it runs before the controller, so the
      // controller tells it explicitly.
      await BruteForceDetector.recordFailure({ ip, identifier: email }, securityAdapter);
      return error(res, 'Invalid email or password', 401);
    }

    // Clear any accumulated failure counters on a genuine success, so a
    // legitimate user who mistyped their password a few times isn't later
    // penalized.
    await BruteForceDetector.recordSuccess({ ip, identifier: email }, securityAdapter);

    const token = authService.signToken(user);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);

    return success(res, { id: user._id, name: user.name, email: user.email });
  } catch (err) {
    return next(err);
  }
}

function logoutHandler(req, res) {
  const { maxAge, ...clearOptions } = COOKIE_OPTIONS;
  res.clearCookie(COOKIE_NAME, clearOptions);
  return success(res, { message: 'Logged out' });
}
/**
 * GET /api/auth/me — sits behind authMiddleware (see authRoutes.js), so
 * req.user is already populated from the verified JWT by the time this
 * runs. This is the ONLY way the frontend can know "is there a valid
 * session?" on page load/refresh, since the token itself lives in an
 * httpOnly cookie that JavaScript is deliberately unable to read.
 */
async function meHandler(req, res, next) {
  try {
    const user = await authService.getUserById(req.user.id);

    if (!user) {
      // Token was valid but the account no longer exists (e.g. deleted
      // after the token was issued) — treat as "not logged in."
      return error(res, 'User not found', 404);
    }

    return success(res, { id: user._id, name: user.name, email: user.email });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  registerHandler,
  loginHandler,
  logoutHandler,
  meHandler,
  COOKIE_NAME,
  COOKIE_OPTIONS,
};

// module.exports = { registerHandler, loginHandler, logoutHandler, COOKIE_NAME, COOKIE_OPTIONS };