const adminUserService = require('../services/adminUserService');
const { success } = require('../utils/apiResponse');

async function listUsersHandler(req, res, next) {
  try {
    const users = await adminUserService.listUsers();
    return success(res, users);
  } catch (err) {
    return next(err);
  }
}

module.exports = { listUsersHandler };