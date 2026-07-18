const { sqlInjectionPatterns } = require('../utils/patterns');

/**
 * SQLInjectionDetector
 *
 * Scans normalized request data (see RequestInspector) for signatures
 * commonly associated with SQL injection attempts.
 *
 * NOTE (Phase 2 scaffolding): `sqlInjectionPatterns` is currently empty, so
 * `scan()` always returns `malicious: false`. Real signatures + matching
 * logic are implemented in Phase 3, alongside unit tests that assert both
 * true positives (known payloads) and true negatives (normal input isn't
 * flagged).
 */
class SQLInjectionDetector {
  /**
   * @param {object} normalizedRequest - output of RequestInspector.extract()
   * @returns {{ malicious: boolean, matchedPattern: string|null, field: string|null }}
   */
  static scan(normalizedRequest) {
    for (const [field, value] of Object.entries(normalizedRequest.fields)) {
      for (const pattern of sqlInjectionPatterns) {
        if (pattern.test(value)) {
          return { malicious: true, matchedPattern: pattern.source, field };
        }
      }
    }

    return { malicious: false, matchedPattern: null, field: null };
  }
}

module.exports = SQLInjectionDetector;