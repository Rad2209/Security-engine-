const securityAdapter = require('../middleware/securityAdapter');

async function listAttackLogs(filters) {
  return securityAdapter.getLogs(filters);
}

async function listBlockedIps() {
  return securityAdapter.listBlockedIps();
}

async function listBlockedAccounts() {
  return securityAdapter.listBlockedAccounts();
}

async function unblockIp(ip) {
  return securityAdapter.unblockIp(ip);
}

async function unblockAccount(identifier) {
  return securityAdapter.unblockAccount(identifier);
}

async function getSecurityStats() {
  return securityAdapter.getStats();
}

module.exports = {
  listAttackLogs,
  listBlockedIps,
  listBlockedAccounts,
  unblockIp,
  unblockAccount,
  getSecurityStats,
};