const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const env = require('../config/env');

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '1h';

/**
 * authService
 *
 * All bcrypt/JWT logic lives here, not in the controller — the controller's
 * job is just to translate HTTP <-> service calls and talk to the Security
 * Engine's BruteForceDetector. Keeping business logic out of the controller
 * is what the architecture doc's "Controllers should never contain
 * detection logic" principle extends to more generally: controllers stay
 * thin everywhere, not just for security checks.
 */

/**
 * @param {{ name: string, email: string, password: string }} input
 * @returns {Promise<import('mongoose').Document>} the created user
 * @throws {Error & { statusCode: number }} if the email is already taken
 */
async function register({ name, email, password }) {
  const existing = await User.findOne({ email });

  if (existing) {
    const err = new Error('An account with this email already exists');
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name, email, passwordHash });
  return user;
}

/**
 * Looks up a user and checks the password. Returns null on ANY failure
 * (user not found OR wrong password) rather than distinguishing between
 * the two — this is deliberate: telling an attacker "no such email" vs
 * "wrong password" leaks which emails are registered (a user-enumeration
 * vulnerability), which is exactly the kind of thing a security-focused
 * project should avoid introducing.
 *
 * @param {{ email: string, password: string }} input
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function validateCredentials({ email, password }) {
  const user = await User.findOne({ email });
  if (!user) return null;

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return null;

  return user;
}

/**
 * @param {{ _id: any, role: string }} user
 * @returns {string} signed JWT
 */
function signToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
}

module.exports = { register, validateCredentials, signToken, TOKEN_EXPIRY };