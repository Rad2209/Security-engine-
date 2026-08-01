/**
 * ResponseHandler
 *
 * Produces a consistent HTTP response shape whenever the engine blocks a
 * request. Centralizing this means the status code / body format for
 * "blocked" responses is defined in exactly one place.
 */
class ResponseHandler {
  /**
   * @param {import('express').Response} res
   * @param {{ reason: string, blockDurationMinutes?: number }} verdict - why the request was blocked
   */
  static block(res, verdict) {
    const statusCode = this._statusFor(verdict.reason);
    const message = this._messageFor(verdict);

    res.status(statusCode).json({
      success: false,
      error: {
        message,
        reason: verdict.reason,
      },
    });
  }

  static _messageFor(verdict) {
    if (verdict.reason === 'xss_detected') {
      return 'XSS attempt detected, Request blocked by Security Engine';
    }

    if (verdict.reason === 'sql_injection_detected') {
      return 'SQLi attempt detected, Request blocked by Security Engine';
    }

    if (verdict.reason === 'account_threshold_exceeded' || verdict.reason === 'ip_threshold_exceeded') {
      const minutes = verdict.blockDurationMinutes ?? 5;
      return `Too many requests, Account blocked for ${minutes} minutes`;
    }

    if (verdict.reason === 'account_blocked' || verdict.reason === 'ip_blocked') {
      const minutes = verdict.blockDurationMinutes ?? 5;
      return `Too many requests, Account blocked for ${minutes} minutes`;
    }

    return 'Request blocked by Security Engine';
  }

  static _statusFor(reason) {
    const rateLimitReasons = [
      'ip_blocked',
      'account_blocked',
      'ip_threshold_exceeded',
      'account_threshold_exceeded',
    ];

    return rateLimitReasons.includes(reason) ? 429 : 403;
  }
}

module.exports = ResponseHandler;