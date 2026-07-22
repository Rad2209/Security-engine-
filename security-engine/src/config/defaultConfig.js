/**
 * defaultConfig.js
 *
 * Baseline configuration for the Security Engine. Any host app can override
 * these values by passing a config object into SecurityEngine.init(). See
 * Configuration.js for how overrides are merged with these defaults.
 */
module.exports = {
  detectors: {
    sqlInjection: {
      enabled: true,
    },
    xss: {
      enabled: true,
    },
    bruteForce: {
      enabled: true,
      maxAttemptsPerIp: 5,
      maxAttemptsPerAccount: 5,
      windowMinutes: 15,
      blockDurationMinutes: 30,
      // Routes the engine should apply brute-force tracking to.
      // Matched against req.path with exact string equality (kept simple
      // deliberately — no wildcard/regex route matching in v1).
      protectedRoutes: ['/api/auth/login', '/api/admin/login'],
    },
  },

  // Requests to these paths skip the engine entirely (e.g. health checks).
  ignorePaths: ['/api/health'],

  // Optional hook invoked whenever the engine blocks a request. Useful for
  // real-time notifications (e.g. pushing to an admin dashboard via socket).
  // Signature: (attackLogEntry) => void
  onBlock: null,
};