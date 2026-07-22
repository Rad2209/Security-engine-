require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const env = require('../src/config/env');
const { Admin } = require('../src/models');

const SALT_ROUNDS = 10;

/**
 * scripts/seedAdmin.js
 *
 * Run manually from the command line — this is the "out-of-band
 * provisioning" mechanism referenced in adminAuthService.js's comments.
 * There is no public POST /api/admin/register route by design, so this
 * script is the only way an admin account gets created.
 *
 * Usage:
 *   node scripts/seedAdmin.js "Admin Name" admin@example.com SomeStrongPassword123
 *
 * Safe to re-run: if an admin with that email already exists, it exits
 * without creating a duplicate rather than erroring or overwriting.
 */
async function seedAdmin() {
  const [, , name, email, password] = process.argv;

  if (!name || !email || !password) {
    console.error('Usage: node scripts/seedAdmin.js "<name>" <email> <password>');
    process.exit(1);
  }

  await mongoose.connect(env.MONGO_URI);

  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`An admin with email "${email}" already exists — nothing to do.`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const admin = await Admin.create({ name, email, passwordHash });

  console.log(`Admin account created: ${admin.email} (id: ${admin._id})`);
  await mongoose.disconnect();
}

seedAdmin().catch((err) => {
  console.error('Failed to seed admin:', err);
  process.exit(1);
});