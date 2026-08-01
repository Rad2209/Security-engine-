const ResponseHandler = require('../src/core/ResponseHandler');

describe('ResponseHandler', () => {
  test('returns a specific XSS block message', () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    ResponseHandler.block(res, { reason: 'xss_detected' });

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'XSS attempt detected, Request blocked by Security Engine',
        }),
      })
    );
  });

  test('returns a specific SQLi block message', () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    ResponseHandler.block(res, { reason: 'sql_injection_detected' });

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'SQLi attempt detected, Request blocked by Security Engine',
        }),
      })
    );
  });

  test('returns a specific brute-force account block message with the configured minute count', () => {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    ResponseHandler.block(res, {
      reason: 'account_threshold_exceeded',
      target: 'account',
      blockDurationMinutes: 5,
    });

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'Too many requests, Account blocked for 5 minutes',
        }),
      })
    );
  });
});
