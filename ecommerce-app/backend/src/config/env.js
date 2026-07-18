/**
 * env.js
 *
 * Loads and validates environment variables at startup. Fails loudly and
 * immediately if a required variable is missing, rather than letting the
 * app boot into a broken state (e.g. crashing on the first DB query with a
 * confusing mongoose error instead of a clear "you forgot MONGO_URI").
 *
 * PORT is not required — Render injects it automatically in production,
 * and 5000 is a sane local default.
 */
require('dotenv').config();

const REQUIRED_VARS = ['MONGO_URI', 'JWT_SECRET', 'FRONTEND_URL'];

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variable(s): ${missing.join(', ')}. ` +
      'Check your .env file against .env.example.'
  );
}

module.exports = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  FRONTEND_URL: process.env.FRONTEND_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
};