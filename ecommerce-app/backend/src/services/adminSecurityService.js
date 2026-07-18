const securityAdapter = require('../middleware/securityAdapter');

/**
 * adminSecurityService
 *
 * The ONE place outside the engine itself that reaches into securityAdapter
 * directly for READ/management operations (viewing logs, viewing/unblocking
 * IPs, stats) rather than detection. Deliberately kept separate from
 * BruteForceDetector's usage in authController/adminAuthController, which is
 * about reporting request OUTCOMES during login, not querying history.
 *
 * Uses listBlockedIps()/getStats() — the "extended" adapter methods noted
 * in StorageAdapter.js as optional/not part of the engine's core required
 * contract, since only an app with an admin dashboard needs them.
 */

async function listAttackLogs(filters) {
  return securityAdapter.getLogs(filters);
}

async function listBlockedIps() {
  return securityAdapter.listBlockedIps();
}

async function unblockIp(ip) {
  return securityAdapter.unblockIp(ip);
}

async function getSecurityStats() {
  return securityAdapter.getStats();
}

module.exports = { listAttackLogs, listBlockedIps, unblockIp, getSecurityStats };