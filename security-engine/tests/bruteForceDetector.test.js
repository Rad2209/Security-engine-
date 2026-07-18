const BruteForceDetector = require('../src/detectors/BruteForceDetector');

const config = {
  enabled: true,
  maxAttemptsPerIp: 10,
  maxAttemptsPerAccount: 5,
  windowMinutes: 15,
  blockDurationMinutes: 30,
  
  // protectedRoutes: ['/api/auth/login', '/api/admin/login'],

  protectedRoutes: new Set(['/api/auth/login', '/api/admin/login']),
};

/**
 * Builds a fresh fake StorageAdapter for each test, backed by plain JS
 * objects instead of a real database. jest.fn() lets us assert on how the
 * detector called it.
 */
function makeFakeAdapter({ ipBlocked = false, accountBlocked = false, ipCount = 0, accountCount = 0 } = {}) {
  return {
    isIpBlocked: jest.fn().mockResolvedValue(ipBlocked),
    isAccountBlocked: jest.fn().mockResolvedValue(accountBlocked),
    countRecentAttempts: jest.fn().mockResolvedValue({ ipCount, accountCount }),
    createBlock: jest.fn().mockResolvedValue(undefined),
    recordFailedAttempt: jest.fn().mockResolvedValue(undefined),
    resetAttempts: jest.fn().mockResolvedValue(undefined),
  };
}

describe('BruteForceDetector.applies', () => {
  test('returns true for a configured protected route', () => {
    expect(BruteForceDetector.applies('/api/auth/login', config)).toBe(true);
  });

  test('returns false for a non-protected route', () => {
    expect(BruteForceDetector.applies('/api/products', config)).toBe(false);
  });

  test('returns false when the detector is disabled', () => {
    expect(BruteForceDetector.applies('/api/auth/login', { ...config, enabled: false })).toBe(false);
  });
});

describe('BruteForceDetector.check', () => {
  test('allows a request with no prior attempts', async () => {
    const adapter = makeFakeAdapter({ ipCount: 0, accountCount: 0 });
    const result = await BruteForceDetector.check(
      { ip: '1.2.3.4', identifier: 'user@example.com' },
      config,
      adapter
    );
    expect(result.blocked).toBe(false);
  });

  test('blocks immediately if the IP is already blocked', async () => {
    const adapter = makeFakeAdapter({ ipBlocked: true });
    const result = await BruteForceDetector.check({ ip: '1.2.3.4', identifier: 'a@b.com' }, config, adapter);
    expect(result.blocked).toBe(true);
    expect(result.reason).toBe('ip_blocked');
  });

  test('blocks immediately if the account is already blocked', async () => {
    const adapter = makeFakeAdapter({ accountBlocked: true });
    const result = await BruteForceDetector.check({ ip: '1.2.3.4', identifier: 'a@b.com' }, config, adapter);
    expect(result.blocked).toBe(true);
    expect(result.reason).toBe('account_blocked');
  });

  test('blocks and creates an IP block once the IP threshold is reached', async () => {
    const adapter = makeFakeAdapter({ ipCount: 10, accountCount: 1 });
    const result = await BruteForceDetector.check({ ip: '1.2.3.4', identifier: 'a@b.com' }, config, adapter);
    expect(result.blocked).toBe(true);
    expect(result.reason).toBe('ip_threshold_exceeded');
    expect(adapter.createBlock).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'ip', value: '1.2.3.4' })
    );
  });

  test('blocks and creates an account block once the account threshold is reached (below IP threshold)', async () => {
    const adapter = makeFakeAdapter({ ipCount: 2, accountCount: 5 });
    const result = await BruteForceDetector.check({ ip: '1.2.3.4', identifier: 'a@b.com' }, config, adapter);
    expect(result.blocked).toBe(true);
    expect(result.reason).toBe('account_threshold_exceeded');
    expect(adapter.createBlock).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'account', value: 'a@b.com' })
    );
  });

  test('IP threshold trips first when both thresholds are exceeded simultaneously', async () => {
    const adapter = makeFakeAdapter({ ipCount: 10, accountCount: 5 });
    const result = await BruteForceDetector.check({ ip: '1.2.3.4', identifier: 'a@b.com' }, config, adapter);
    expect(result.reason).toBe('ip_threshold_exceeded');
  });

  test('does not check account threshold when no identifier was supplied', async () => {
    const adapter = makeFakeAdapter({ ipCount: 2, accountCount: 999 });
    const result = await BruteForceDetector.check({ ip: '1.2.3.4', identifier: undefined }, config, adapter);
    expect(result.blocked).toBe(false);
    expect(adapter.isAccountBlocked).not.toHaveBeenCalled();
  });
});

describe('BruteForceDetector.recordFailure / recordSuccess', () => {
  test('recordFailure calls storageAdapter.recordFailedAttempt with ip + identifier', async () => {
    const adapter = makeFakeAdapter();
    await BruteForceDetector.recordFailure({ ip: '1.2.3.4', identifier: 'a@b.com' }, adapter);
    expect(adapter.recordFailedAttempt).toHaveBeenCalledWith({ ip: '1.2.3.4', identifier: 'a@b.com' });
  });

  test('recordSuccess calls storageAdapter.resetAttempts with ip + identifier', async () => {
    const adapter = makeFakeAdapter();
    await BruteForceDetector.recordSuccess({ ip: '1.2.3.4', identifier: 'a@b.com' }, adapter);
    expect(adapter.resetAttempts).toHaveBeenCalledWith({ ip: '1.2.3.4', identifier: 'a@b.com' });
  });
});