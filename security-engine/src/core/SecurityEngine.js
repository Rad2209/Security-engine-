const RequestInspector = require('./RequestInspector');
const ResponseHandler = require('./ResponseHandler');
const SQLInjectionDetector = require('../detectors/SQLInjectionDetector');
const XSSDetector = require('../detectors/XSSDetector');
const BruteForceDetector = require('../detectors/BruteForceDetector');
const Logger = require('../logging/Logger');
const { buildConfig } = require('../config/Configuration');

/**
 * SecurityEngine
 *
 * The orchestrator. Returns an Express middleware function that runs on
 * every request (except configured ignorePaths), in this order:
 *
 *   1. Brute-force check (only for configured protected routes)
 *   2. SQL Injection scan
 *   3. XSS scan
 *
 * First detector to flag a request short-circuits everything after it —
 * the request is logged and blocked, and the app's controllers are never
 * reached. If nothing flags, next() is called and the request proceeds
 * normally.
 */
class SecurityEngine {
  /**
   * @param {object} userConfig - see config/defaultConfig.js for shape;
   *   must include `storageAdapter`.
   * @returns {import('express').RequestHandler}
   */
  static init(userConfig) {
    const config = buildConfig(userConfig);
    const { storageAdapter } = config;

    return async function securityEngineMiddleware(req, res, next) {
      try {
        if (config.ignorePaths.includes(req.path)) {
          return next();
        }

        const normalized = RequestInspector.extract(req);

        // 1. Brute-force check — only applies to configured auth routes.
        const bfConfig = config.detectors.bruteForce;
        if (BruteForceDetector.applies(req.path, bfConfig)) {
          const identifier = req.body && (req.body.email || req.body.username);
          const verdict = await BruteForceDetector.check(
            { ip: normalized.ip, identifier },
            bfConfig,
            storageAdapter
          );

          if (verdict.blocked) {
            await Logger.log(
              {
                type: 'BRUTE_FORCE',
                ip: normalized.ip,
                endpoint: normalized.path,
                method: normalized.method,
                payload: identifier || '',
                severity: 'medium',
                blocked: true,
              },
              storageAdapter,
              config.onBlock
            );
            return ResponseHandler.block(res, verdict);
          }
        }

        // 2. SQL Injection scan
        if (config.detectors.sqlInjection.enabled) {
          const sqlVerdict = SQLInjectionDetector.scan(normalized);
          if (sqlVerdict.malicious) {
            await Logger.log(
              {
                type: 'SQL_INJECTION',
                ip: normalized.ip,
                endpoint: normalized.path,
                method: normalized.method,
                payload: normalized.fields[sqlVerdict.field],
                severity: 'high',
                blocked: true,
              },
              storageAdapter,
              config.onBlock
            );
            return ResponseHandler.block(res, { reason: 'sql_injection_detected' });
          }
        }

        // 3. XSS scan
        if (config.detectors.xss.enabled) {
          const xssVerdict = XSSDetector.scan(normalized);
          if (xssVerdict.malicious) {
            await Logger.log(
              {
                type: 'XSS',
                ip: normalized.ip,
                endpoint: normalized.path,
                method: normalized.method,
                payload: normalized.fields[xssVerdict.field],
                severity: 'high',
                blocked: true,
              },
              storageAdapter,
              config.onBlock
            );
            return ResponseHandler.block(res, { reason: 'xss_detected' });
          }
        }

        return next();
      } catch (err) {
        // Fail closed: an internal engine error must never silently allow
        // the request through to the controller. Pass it to the host app's
        // error-handling middleware (via next(err)) instead of calling
        // next() — this stops the request here rather than letting it
        // proceed as if it had been ALLOWed.
        return next(err);
      }
    };
  }
}

module.exports = SecurityEngine;