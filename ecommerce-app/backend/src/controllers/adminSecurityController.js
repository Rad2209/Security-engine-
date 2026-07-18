const adminSecurityService = require('../services/adminSecurityService');
const { success } = require('../utils/apiResponse');

async function listLogsHandler(req, res, next) {
  try {
    const { type, ip, from, to, limit } = req.query;
    const logs = await adminSecurityService.listAttackLogs({ type, ip, from, to, limit });
    return success(res, logs);
  } catch (err) {
    return next(err);
  }
}

async function listBlockedIpsHandler(req, res, next) {
  try {
    const blockedIps = await adminSecurityService.listBlockedIps();
    return success(res, blockedIps);
  } catch (err) {
    return next(err);
  }
}

async function unblockIpHandler(req, res, next) {
  try {
    await adminSecurityService.unblockIp(req.params.ip);
    return success(res, { message: `IP ${req.params.ip} unblocked` });
  } catch (err) {
    return next(err);
  }
}

async function getStatsHandler(req, res, next) {
  try {
    const stats = await adminSecurityService.getSecurityStats();
    return success(res, stats);
  } catch (err) {
    return next(err);
  }
}

module.exports = { listLogsHandler, listBlockedIpsHandler, unblockIpHandler, getStatsHandler };