const mongoose = globalThis.__securityEngineMongoose || require('mongoose');
const StorageAdapter = require('./StorageAdapter');

/**
 * MongoStorageAdapter
 *
 * Default StorageAdapter implementation shipped with the engine for
 * convenience. Important: this defines its OWN Mongoose schemas/collections
 * (attacklogs, loginattempts, blockedips, blockedaccounts) — it does NOT
 * touch the host app's User/Product/etc. models. This is what keeps the
 * engine decoupled even though a ready-made Mongo adapter ships with it:
 * the engine owns its own data, the host app owns its own data, and they
 * happen to live in the same physical database.
 *
 * A host app can use this as-is by passing `new MongoStorageAdapter()` into
 * SecurityEngine.init(), or write a completely different adapter (Redis,
 * Postgres, in-memory for tests) implementing the same interface instead.
 *
 * Assumes mongoose.connect() has already been called by the host app before
 * this adapter is used — connection management is the host app's
 * responsibility, not the engine's.
 */

const attackLogSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: ['SQL_INJECTION', 'XSS', 'BRUTE_FORCE'] },
  ip: { type: String, required: true },
  endpoint: { type: String, required: true },
  method: { type: String, required: true },
  payloadSnippet: { type: String, default: '' },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  blocked: { type: Boolean, default: true },
  timestamp: { type: Date, default: Date.now },
});

const loginAttemptSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  identifier: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const blockedIpSchema = new mongoose.Schema({
  ip: { type: String, required: true, unique: true },
  reason: { type: String },
  blockedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  active: { type: Boolean, default: true },
});

const blockedAccountSchema = new mongoose.Schema({
  identifier: { type: String, required: true, unique: true },
  reason: { type: String },
  blockedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  active: { type: Boolean, default: true },
});

// Guard against OverwriteModelError if this file is ever required twice
// (e.g. in tests) by reusing an existing compiled model when present.

attackLogSchema.index({ timestamp: -1 });
attackLogSchema.index({ type: 1, timestamp: -1 });
attackLogSchema.index({ ip: 1, timestamp: -1 });

loginAttemptSchema.index({ ip: 1, timestamp: -1 });
loginAttemptSchema.index({ identifier: 1, timestamp: -1 });

blockedIpSchema.index({ active: 1, expiresAt: 1 });
blockedAccountSchema.index({ active: 1, expiresAt: 1 });

function modelOrCreate(name, schema) {
  return mongoose.models[name] || mongoose.model(name, schema);
}

const AttackLog = modelOrCreate('SecurityEngine_AttackLog', attackLogSchema);
const LoginAttempt = modelOrCreate('SecurityEngine_LoginAttempt', loginAttemptSchema);
const BlockedIp = modelOrCreate('SecurityEngine_BlockedIp', blockedIpSchema);
const BlockedAccount = modelOrCreate('SecurityEngine_BlockedAccount', blockedAccountSchema);

class MongoStorageAdapter extends StorageAdapter {
  async isIpBlocked(ip) {
    const block = await BlockedIp.findOne({ ip, active: true, expiresAt: { $gt: new Date() } });
    return !!block;
  }

  async isAccountBlocked(identifier) {
    const block = await BlockedAccount.findOne({
      identifier,
      active: true,
      expiresAt: { $gt: new Date() },
    });
    return !!block;
  }

  async recordFailedAttempt({ ip, identifier }) {
    await LoginAttempt.create({ ip, identifier });
  }

  async countRecentAttempts({ ip, identifier, windowMinutes }) {
    const since = new Date(Date.now() - windowMinutes * 60 * 1000);

    const ipCount = await LoginAttempt.countDocuments({ ip, timestamp: { $gte: since } });

    const accountCount = identifier
      ? await LoginAttempt.countDocuments({ identifier, timestamp: { $gte: since } })
      : 0;

    return { ipCount, accountCount };
  }

  async resetAttempts({ ip, identifier }) {
    const filter = identifier ? { $or: [{ ip }, { identifier }] } : { ip };
    await LoginAttempt.deleteMany(filter);
  }

  async createBlock({ type, value, reason, expiresAt }) {
    if (type === 'ip') {
      await BlockedIp.findOneAndUpdate(
        { ip: value },
        { ip: value, reason, expiresAt, active: true, blockedAt: new Date() },
        { upsert: true }
      );
    } else if (type === 'account') {
      await BlockedAccount.findOneAndUpdate(
        { identifier: value },
        { identifier: value, reason, expiresAt, active: true, blockedAt: new Date() },
        { upsert: true }
      );
    } else {
      throw new Error(`MongoStorageAdapter.createBlock: unknown type "${type}"`);
    }
  }

  async unblockIp(ip) {
    await BlockedIp.findOneAndUpdate({ ip }, { active: false });
  }

  async saveAttackLog(entry) {
    await AttackLog.create(entry);
  }

  async getLogs(filters = {}) {
    const query = {};

    if (filters.type) query.type = filters.type;
    if (filters.ip) query.ip = filters.ip;
    if (filters.from || filters.to) {
      query.timestamp = {};
      if (filters.from) query.timestamp.$gte = filters.from;
      if (filters.to) query.timestamp.$lte = filters.to;
    }

    return AttackLog.find(query)
      .sort({ timestamp: -1 })
      .limit(filters.limit || 100)
      .lean();
  }
  async listBlockedIps() {
    return BlockedIp.find({ active: true, expiresAt: { $gt: new Date() } })
      .sort({ blockedAt: -1 })
      .lean();
  }

  async getStats() {
    const [byTypeAgg, activeBlockedIps, activeBlockedAccounts] = await Promise.all([
      AttackLog.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
      BlockedIp.countDocuments({ active: true, expiresAt: { $gt: new Date() } }),
      BlockedAccount.countDocuments({ active: true, expiresAt: { $gt: new Date() } }),
    ]);

    const byType = { SQL_INJECTION: 0, XSS: 0, BRUTE_FORCE: 0 };
    byTypeAgg.forEach((entry) => {
      byType[entry._id] = entry.count;
    });

    const totalAttacks = Object.values(byType).reduce((sum, count) => sum + count, 0);

    return { totalAttacks, byType, activeBlockedIps, activeBlockedAccounts };
  }
}

module.exports = MongoStorageAdapter;