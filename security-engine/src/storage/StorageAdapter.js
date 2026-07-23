/**
 * StorageAdapter (interface)
 *
 * The Security Engine never talks to a database directly. Every host app that
 * uses this engine must provide an object implementing these methods. This is
 * the seam that keeps the engine framework/DB-agnostic.
 *
 * Extend this class and override every method, OR simply pass a plain object
 * with the same method names (duck typing) — either works, since Configuration
 * validates the adapter has all required methods before the engine starts.
 *
 * All methods are async (return Promises) so any backing store — Mongo, Redis,
 * Postgres, even an in-memory Map for tests — can implement this contract.
 */
class StorageAdapter {
  /** @param {string} ip @returns {Promise<boolean>} */
  async isIpBlocked(ip) {
    throw new Error('StorageAdapter.isIpBlocked() not implemented');
  }

  /** @param {string} identifier - username/email attempted @returns {Promise<boolean>} */
  async isAccountBlocked(identifier) {
    throw new Error('StorageAdapter.isAccountBlocked() not implemented');
  }

  /**
   * Record a failed login attempt for both IP and account tracking.
   * @param {{ ip: string, identifier: string }} attempt
   * @returns {Promise<void>}
   */
  async recordFailedAttempt(attempt) {
    throw new Error('StorageAdapter.recordFailedAttempt() not implemented');
  }

  /**
   * Count failed attempts within a rolling time window.
   * @param {{ ip: string, identifier: string, windowMinutes: number }} query
   * @returns {Promise<{ ipCount: number, accountCount: number }>}
   */
  async countRecentAttempts(query) {
    throw new Error('StorageAdapter.countRecentAttempts() not implemented');
  }

  /**
   * Reset failed-attempt counters, e.g. after a successful login.
   * @param {{ ip: string, identifier: string }} target
   * @returns {Promise<void>}
   */
  async resetAttempts(target) {
    throw new Error('StorageAdapter.resetAttempts() not implemented');
  }

  /**
   * Persist a block (IP and/or account).
   * @param {{ type: 'ip'|'account', value: string, reason: string, expiresAt: Date }} block
   * @returns {Promise<void>}
   */
  async createBlock(block) {
    throw new Error('StorageAdapter.createBlock() not implemented');
  }

  /** @param {string} ip @returns {Promise<void>} */
  async unblockIp(ip) {
    throw new Error('StorageAdapter.unblockIp() not implemented');
  }

  /**
   * Persist a structured attack log entry.
   * @param {{ type: string, ip: string, endpoint: string, method: string, payloadSnippet: string, severity: string, blocked: boolean }} entry
   * @returns {Promise<void>}
   */
  async saveAttackLog(entry) {
    throw new Error('StorageAdapter.saveAttackLog() not implemented');
  }

  /**
   * Retrieve logs, optionally filtered — used by the admin dashboard.
   * @param {{ type?: string, ip?: string, from?: Date, to?: Date, limit?: number }} filters
   * @returns {Promise<Array<object>>}
   */
  async getLogs(filters) {
    throw new Error('StorageAdapter.getLogs() not implemented');
  }
  /**
   * Retrieve logs, optionally filtered — used by the admin dashboard.
   * @param {{ type?: string, ip?: string, from?: Date, to?: Date, limit?: number }} filters
   * @returns {Promise<Array<object>>}
   */
  async getLogs(filters) {
    throw new Error('StorageAdapter.getLogs() not implemented');
  }

  /**
   * EXTENDED / OPTIONAL — not part of Configuration's REQUIRED_ADAPTER_METHODS.
   * The core engine (detection/blocking on the way in) never calls this;
   * it exists purely for admin-dashboard reporting. An adapter used only
   * for gate-keeping (no admin dashboard) is not required to implement it.
   *
   * @returns {Promise<Array<{ ip: string, reason: string, blockedAt: Date, expiresAt: Date }>>}
   */
  async listBlockedIps() {
    throw new Error('StorageAdapter.listBlockedIps() not implemented');
  }

  /**
   * EXTENDED / OPTIONAL — same reasoning as listBlockedIps() above.
   * @returns {Promise<{ totalAttacks: number, byType: object, activeBlockedIps: number, activeBlockedAccounts: number }>}
   */
  async getStats() {
    throw new Error('StorageAdapter.getStats() not implemented');
  }
  /**
 * @param {string} identifier
 * @returns {Promise<void>}
 */
async unblockAccount(identifier) {
  throw new Error('StorageAdapter.unblockAccount() not implemented');
}
/**
 * EXTENDED / OPTIONAL — same reasoning as listBlockedIps() above. This
 * was missing for a while even though BruteForceDetector has always been
 * capable of creating account-level blocks (via createBlock({type:
 * 'account', ...})) independently of IP blocks — meaning an account
 * could be blocked with no way for an admin to see or undo it. Fixed by
 * adding the missing read/management surface, not by changing the
 * blocking logic itself, which was already correct.
 *
 * @returns {Promise<Array<{ identifier: string, reason: string, blockedAt: Date, expiresAt: Date }>>}
 */
async listBlockedAccounts() {
  throw new Error('StorageAdapter.listBlockedAccounts() not implemented');
}
}

module.exports = StorageAdapter;