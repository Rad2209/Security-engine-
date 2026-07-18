const { User } = require('../models');

/**
 * Excludes passwordHash explicitly with .select('-passwordHash') even
 * though the field would never be intentionally rendered by any frontend
 * code — defense in depth against a future accidental `res.json(user)`
 * somewhere that forgets to strip it.
 */
async function listUsers() {
  return User.find().select('-passwordHash').sort({ createdAt: -1 }).lean();
}

module.exports = { listUsers };