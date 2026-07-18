const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Admin } = require('../models');
const env = require('../config/env');

const TOKEN_EXPIRY = '1h';

/**
 * adminAuthService
 *
 * Deliberately NOT reusing authService, even though the logic looks
 * similar — this keeps admin and customer authentication as fully
 * independent code paths (per architecture doc §9). A bug or future change
 * in customer auth can never accidentally affect admin auth, because
 * there's no shared function between them beyond bcrypt/jwt themselves.
 *
 * No `register()` here on purpose — admins are provisioned out-of-band
 * (seed script), not through a public endpoint.
 */

/**
 * Same enumeration-safe design as authService.validateCredentials: returns
 * null on both "no such admin" and "wrong password", never distinguishing.
 *
 * @param {{ email: string, password: string }} input
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function validateAdminCredentials({ email, password }) {
  const admin = await Admin.findOne({ email });
  if (!admin) return null;

  const match = await bcrypt.compare(password, admin.passwordHash);
  if (!match) return null;

  return admin;
}

/**
 * @param {{ _id: any, role: string }} admin
 * @returns {string} signed JWT
 */
function signAdminToken(admin) {
  return jwt.sign({ sub: admin._id.toString(), role: admin.role }, env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

module.exports = { validateAdminCredentials, signAdminToken, TOKEN_EXPIRY };