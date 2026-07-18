/**
 * BruteForceDetector
 *
 * Unlike the SQLi/XSS detectors, brute-force detection isn't signature-based
 * — it's a counting problem, so the full logic is implemented now rather
 * than deferred to Phase 3.
 *
 * Design (per locked decision): a request is blocked if EITHER the IP OR the
 * account (identifier) has exceeded its own failure threshold within the
 * configured time window — whichever trips first.
 *
 * Important boundary: this detector only decides ALLOW/BLOCK on the way IN.
 * It does NOT know whether a login attempt succeeded or failed — that only
 * becomes known after the app's AuthController runs bcrypt.compare(). So a
 * second method, `recordFailure()`, is exposed for the host app to call
 * explicitly after a failed login. This keeps the engine from needing to
 * inspect/wrap response bodies.
 */
class BruteForceDetector {
  /**
   * @param {string} path - req.path, used to check against protectedRoutes
   * @param {object} config - config.detectors.bruteForce
   * @returns {boolean} whether this route should be tracked at all
   */
  // static applies(path, config) {
  //   return config.enabled && config.protectedRoutes.includes(path);
  // }

    static applies(path, config) {
    return config.enabled && config.protectedRoutes.has(path);
  }

  /**
   * Checks whether the current IP or account is already blocked, or has
   * exceeded threshold, BEFORE the request is allowed through.
   *
   * @param {{ ip: string, identifier: string|undefined }} params
   * @param {object} config - config.detectors.bruteForce
   * @param {import('../storage/StorageAdapter')} storageAdapter
   * @returns {Promise<{ blocked: boolean, reason: string|null }>}
   */
  // static async check({ ip, identifier }, config, storageAdapter) {
  //   // Existing, still-active blocks take priority over re-counting attempts.
  //   const ipBlocked = await storageAdapter.isIpBlocked(ip);
  //   if (ipBlocked) {
  //     return { blocked: true, reason: 'ip_blocked' };
  //   }

  //   if (identifier) {
  //     const accountBlocked = await storageAdapter.isAccountBlocked(identifier);
  //     if (accountBlocked) {
  //       return { blocked: true, reason: 'account_blocked' };
  //     }
  //   }

  //   const { ipCount, accountCount } = await storageAdapter.countRecentAttempts({
  //     ip,
  //     identifier,
  //     windowMinutes: config.windowMinutes,
  //   });

  //   if (ipCount >= config.maxAttemptsPerIp) {
  //     await this._blockIp(ip, config, storageAdapter);
  //     return { blocked: true, reason: 'ip_threshold_exceeded' };
  //   }

  //   if (identifier && accountCount >= config.maxAttemptsPerAccount) {
  //     await this._blockAccount(identifier, config, storageAdapter);
  //     return { blocked: true, reason: 'account_threshold_exceeded' };
  //   }

  //   return { blocked: false, reason: null };
  // }


  static async check({ ip, identifier }, config, storageAdapter) {
    const [ipBlocked, accountBlocked] = await Promise.all([
      storageAdapter.isIpBlocked(ip),
      identifier ? storageAdapter.isAccountBlocked(identifier) : Promise.resolve(false),
    ]);

    if (ipBlocked) {
      return { blocked: true, reason: 'ip_blocked' };
    }

    if (accountBlocked) {
      return { blocked: true, reason: 'account_blocked' };
    }

    const { ipCount, accountCount } = await storageAdapter.countRecentAttempts({
      ip,
      identifier,
      windowMinutes: config.windowMinutes,
    });

    if (ipCount >= config.maxAttemptsPerIp) {
      await this._blockIp(ip, config, storageAdapter);
      return { blocked: true, reason: 'ip_threshold_exceeded' };
    }

    if (identifier && accountCount >= config.maxAttemptsPerAccount) {
      await this._blockAccount(identifier, config, storageAdapter);
      return { blocked: true, reason: 'account_threshold_exceeded' };
    }

    return { blocked: false, reason: null };
  }

  /**
   * Called by the host app's AuthController after a failed login (wrong
   * password / unknown user), so the engine can increment its counters.
   * Deliberately a separate, explicit call rather than the engine inferring
   * failure from a response status code — see Phase 1 design doc §12 item 1.
   *
   * @param {{ ip: string, identifier: string }} params
   * @param {import('../storage/StorageAdapter')} storageAdapter
   */
  static async recordFailure({ ip, identifier }, storageAdapter) {
    await storageAdapter.recordFailedAttempt({ ip, identifier });
  }

  /**
   * Called by the host app's AuthController after a SUCCESSFUL login, to
   * clear counters so a legitimate user isn't punished for earlier typos.
   *
   * @param {{ ip: string, identifier: string }} params
   * @param {import('../storage/StorageAdapter')} storageAdapter
   */
  static async recordSuccess({ ip, identifier }, storageAdapter) {
    await storageAdapter.resetAttempts({ ip, identifier });
  }

  static async _blockIp(ip, config, storageAdapter) {
    const expiresAt = new Date(Date.now() + config.blockDurationMinutes * 60 * 1000);
    await storageAdapter.createBlock({
      type: 'ip',
      value: ip,
      reason: `Exceeded ${config.maxAttemptsPerIp} failed attempts within ${config.windowMinutes} minutes`,
      expiresAt,
    });
  }

  static async _blockAccount(identifier, config, storageAdapter) {
    const expiresAt = new Date(Date.now() + config.blockDurationMinutes * 60 * 1000);
    await storageAdapter.createBlock({
      type: 'account',
      value: identifier,
      reason: `Exceeded ${config.maxAttemptsPerAccount} failed attempts within ${config.windowMinutes} minutes`,
      expiresAt,
    });
  }
}

module.exports = BruteForceDetector;