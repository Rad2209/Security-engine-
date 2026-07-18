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
   * @param {{ reason: string }} verdict - why the request was blocked
   */
  static block(res, verdict) {
    const statusCode = this._statusFor(verdict.reason);

    res.status(statusCode).json({
      success: false,
      error: {
        message: 'Request blocked by Security Engine',
        reason: verdict.reason,
      },
    });
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