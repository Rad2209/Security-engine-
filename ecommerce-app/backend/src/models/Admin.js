const mongoose = require('mongoose');

/**
 * Admin
 *
 * Fully separate from User by design (see architecture doc §9): even though
 * both roles authenticate with bcrypt + JWT, they never share a schema or a
 * login code path, so a compromised customer flow can't be leveraged to
 * reach admin routes.
 */
const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Admin || mongoose.model('Admin', adminSchema);