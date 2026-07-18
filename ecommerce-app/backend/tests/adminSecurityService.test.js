jest.mock('../src/middleware/securityAdapter', () => ({
  getLogs: jest.fn(),
  listBlockedIps: jest.fn(),
  unblockIp: jest.fn(),
  getStats: jest.fn(),
}));

const securityAdapter = require('../src/middleware/securityAdapter');
const adminSecurityService = require('../src/services/adminSecurityService');

afterEach(() => jest.clearAllMocks());

describe('adminSecurityService', () => {
  test('listAttackLogs passes filters through to securityAdapter.getLogs unchanged', async () => {
    securityAdapter.getLogs.mockResolvedValue([{ type: 'XSS' }]);
    const filters = { type: 'XSS', limit: 10 };

    const result = await adminSecurityService.listAttackLogs(filters);

    expect(securityAdapter.getLogs).toHaveBeenCalledWith(filters);
    expect(result).toEqual([{ type: 'XSS' }]);
  });

  test('listBlockedIps delegates to securityAdapter.listBlockedIps', async () => {
    securityAdapter.listBlockedIps.mockResolvedValue([{ ip: '1.2.3.4' }]);
    const result = await adminSecurityService.listBlockedIps();
    expect(securityAdapter.listBlockedIps).toHaveBeenCalledTimes(1);
    expect(result).toEqual([{ ip: '1.2.3.4' }]);
  });

  test('unblockIp delegates to securityAdapter.unblockIp with the given ip', async () => {
    await adminSecurityService.unblockIp('1.2.3.4');
    expect(securityAdapter.unblockIp).toHaveBeenCalledWith('1.2.3.4');
  });

  test('getSecurityStats delegates to securityAdapter.getStats', async () => {
    securityAdapter.getStats.mockResolvedValue({ totalAttacks: 5 });
    const result = await adminSecurityService.getSecurityStats();
    expect(securityAdapter.getStats).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ totalAttacks: 5 });
  });
});