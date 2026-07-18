const mongoose = require('mongoose');

/**
 * User (customer account)
 *
 * Deliberately separate from Admin (see Admin.js) — no shared schema, no
 * shared auth code path. passwordHash is set by authService using bcrypt;
 * this model never sees a plaintext password.
 */
const userSchema = new mongoose.Schema(
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
      enum: ['customer'],
      default: 'customer',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);